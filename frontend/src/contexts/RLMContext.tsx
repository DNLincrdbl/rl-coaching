'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { IconType } from 'react-icons';
import { FaMedal, FaCog, FaRocket, FaBullseye, FaCrown } from 'react-icons/fa';
import { api } from '@/lib/api';
import { CoachingSheet } from '@/lib/data/coaching';

export type SubscriptionTier = 'pro' | 'basic';
export type ArenaTreeId = 'dribble' | 'aerial';

// Community/leaderboard unlock is driven by the backend, but keep constants
// as sensible fallbacks for the UI copy.
export const RLM_MEMBER_COUNT = 12;
export const COMMUNITY_UNLOCK_THRESHOLD = 20;

export const RL_RANKS = [
  'Bronze I', 'Bronze II', 'Bronze III',
  'Silver I', 'Silver II', 'Silver III',
  'Gold I', 'Gold II', 'Gold III',
  'Platinum I', 'Platinum II', 'Platinum III',
  'Diamond I', 'Diamond II', 'Diamond III',
  'Champion I', 'Champion II', 'Champion III',
  'Grand Champion I', 'Grand Champion II', 'Grand Champion III',
  'Supersonic Legend',
];

export interface ProfileBadgeOption {
  id: string;
  name: string;
  icon: IconType;
  requiredLevel: number;
}

export const PROFILE_BADGES: ProfileBadgeOption[] = [
  { id: 'rookie', name: 'Rookie', icon: FaMedal, requiredLevel: 1 },
  { id: 'grinder', name: 'Grinder', icon: FaCog, requiredLevel: 5 },
  { id: 'aerialist', name: 'Aerialist', icon: FaRocket, requiredLevel: 10 },
  { id: 'dribbler', name: 'Dribbler', icon: FaBullseye, requiredLevel: 15 },
  { id: 'legend', name: 'Legend', icon: FaCrown, requiredLevel: 25 },
];

// XP helpers (mirror the backend formula).
export function getLevelFromXP(xp: number): number {
  let level = 1;
  let required = 100;
  let total = 0;
  while (total + required <= xp) {
    total += required;
    level++;
    required = 100 + (level - 1) * 10;
  }
  return level;
}

export function getXPProgressInLevel(xp: number): { current: number; required: number } {
  let level = 1;
  let required = 100;
  let total = 0;
  while (total + required <= xp) {
    total += required;
    level++;
    required = 100 + (level - 1) * 10;
  }
  return { current: xp - total, required };
}

export interface RLMNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface ReplaySubmission {
  id: number;
  replayUrl: string;
  videoUrl: string | null;
  hasVideo: boolean;
  note: string;
  status: 'pending' | 'reviewed';
  sheetId: string | null;
  createdAt: string;
}

export interface CourseProgress {
  courseId: string;
  progress: number;
}

// The profile shape consumed by the UI (mapped from the backend).
export interface RLMProfile {
  id: number | null;
  rank: string | null;
  level: number;
  xp: number;
  subscriptionTier: SubscriptionTier;
  coachingCredits: number;
  extraReplayCredits: number;
  selectedBadge: string | null;
  arenaProgress: Record<ArenaTreeId, string[]>;
  discordCoaching: boolean;
  coachingSheets: CoachingSheet[];
  notifications: RLMNotification[];
  submissions: ReplaySubmission[];
  joinedAt: string;
  hasSelectedRank: boolean;
  rlmPurchased: boolean;
  equippedProfilePicture: string | null;
  equippedProfileBanner: string | null;
  courseProgress: CourseProgress[];
}

interface BackendProfile {
  id: number;
  rank: string | null;
  level: number;
  xp: number;
  subscriptionTier: SubscriptionTier;
  coachingCredits: number;
  extraReplayCredits: number;
  selectedBadge: string | null;
  arenaProgress: Record<ArenaTreeId, string[]>;
  discordCoaching: boolean;
  coachingSheets: CoachingSheet[];
  notifications: RLMNotification[];
  submissions: ReplaySubmission[];
  courseProgress?: CourseProgress[];
  createdAt: string;
}

const EMPTY_PROFILE: RLMProfile = {
  id: null,
  rank: null,
  level: 1,
  xp: 0,
  subscriptionTier: 'pro',
  coachingCredits: 0,
  extraReplayCredits: 0,
  selectedBadge: 'rookie',
  arenaProgress: { dribble: [], aerial: [] },
  discordCoaching: true,
  coachingSheets: [],
  notifications: [],
  submissions: [],
  joinedAt: new Date().toISOString(),
  hasSelectedRank: false,
  rlmPurchased: true,
  equippedProfilePicture: null,
  equippedProfileBanner: null,
  courseProgress: [],
};

function mapProfile(bp: BackendProfile): RLMProfile {
  return {
    id: bp.id,
    rank: bp.rank,
    level: bp.level,
    xp: bp.xp,
    subscriptionTier: bp.subscriptionTier,
    coachingCredits: bp.coachingCredits,
    extraReplayCredits: bp.extraReplayCredits,
    selectedBadge: bp.selectedBadge,
    arenaProgress: {
      dribble: bp.arenaProgress?.dribble ?? [],
      aerial: bp.arenaProgress?.aerial ?? [],
    },
    discordCoaching: bp.discordCoaching,
    coachingSheets: bp.coachingSheets ?? [],
    notifications: bp.notifications ?? [],
    submissions: bp.submissions ?? [],
    joinedAt: bp.createdAt,
    hasSelectedRank: Boolean(bp.rank),
    rlmPurchased: true,
    equippedProfilePicture: null,
    equippedProfileBanner: null,
    courseProgress: bp.courseProgress ?? [],
  };
}

interface RLMContextType {
  profile: RLMProfile;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  selectRank: (rank: string) => Promise<void>;
  setRank: (rank: string) => Promise<void>;
  selectBadge: (badgeId: string) => Promise<void>;
  setSubscriptionTier: (tier: SubscriptionTier) => Promise<void>;
  completeArenaNode: (tree: ArenaTreeId, nodeId: string, xp?: number) => Promise<void>;
  submitReplay: (payload: { video: File; note?: string; useDiscord: boolean }) => Promise<void>;
  purchaseExtraReplay: () => Promise<void>;
  updateSheet: (sheet: CoachingSheet) => Promise<void>;
  publishSheet: (sheetId: string, published: boolean) => Promise<CoachingSheet>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  updateCourseProgress: (courseId: string, progress: number) => Promise<void>;
}

const RLMContext = createContext<RLMContextType | undefined>(undefined);

export function RLMProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<RLMProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  const applyBackend = useCallback((bp: BackendProfile) => {
    setProfile(mapProfile(bp));
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get<{ user: BackendProfile }>('/api/auth/me');
      applyBackend(res.user);
    } catch {
      // not logged in — leave empty profile
    }
  }, [applyBackend]);

  useEffect(() => {
    (async () => {
      await refreshProfile();
      setIsLoading(false);
    })();
  }, [refreshProfile]);

  const selectRank = async (rank: string) => {
    const res = await api.patch<{ user: BackendProfile }>('/api/profile', { rank });
    applyBackend(res.user);
  };

  const selectBadge = async (badgeId: string) => {
    const res = await api.patch<{ user: BackendProfile }>('/api/profile', { selectedBadge: badgeId });
    applyBackend(res.user);
  };

  const setSubscriptionTier = async (tier: SubscriptionTier) => {
    const res = await api.patch<{ user: BackendProfile }>('/api/profile', { subscriptionTier: tier });
    applyBackend(res.user);
  };

  const completeArenaNode = async (tree: ArenaTreeId, nodeId: string) => {
    const res = await api.post<{ user: BackendProfile }>('/api/arena/complete', { tree, nodeId });
    applyBackend(res.user);
  };

  const submitReplay = async (payload: { video: File; note?: string; useDiscord: boolean }) => {
    const form = new FormData();
    form.append('video', payload.video);
    form.append('note', payload.note ?? '');
    form.append('useDiscord', String(payload.useDiscord));
    const res = await api.postForm<{ user: BackendProfile }>('/api/coaching/submit-replay', form);
    applyBackend(res.user);
  };

  const purchaseExtraReplay = async () => {
    const res = await api.post<{ user: BackendProfile }>('/api/coaching/purchase-replay');
    applyBackend(res.user);
  };

  const updateSheet = async (sheet: CoachingSheet) => {
    const res = await api.patch<{ sheet: CoachingSheet }>(`/api/sheets/${sheet.id}`, {
      title: sheet.title,
      videoUrl: sheet.videoUrl,
      summary: sheet.summary,
      ratings: sheet.ratings,
      timestamps: sheet.timestamps,
    });
    setProfile((prev) => ({
      ...prev,
      coachingSheets: prev.coachingSheets.map((s) => (s.id === sheet.id ? res.sheet : s)),
    }));
  };

  const publishSheet = async (sheetId: string, published: boolean) => {
    const res = await api.post<{ sheet: CoachingSheet }>(`/api/sheets/${sheetId}/publish`, { published });
    setProfile((prev) => ({
      ...prev,
      coachingSheets: prev.coachingSheets.map((s) => (s.id === sheetId ? res.sheet : s)),
    }));
    return res.sheet;
  };

  const markNotificationRead = async (notificationId: string) => {
    setProfile((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    }));
    try {
      await api.post(`/api/profile/notifications/${notificationId}/read`);
    } catch {
      /* ignore */
    }
  };

  const updateCourseProgress = async (courseId: string, progress: number) => {
    // Optimistic local update, then persist to the backend.
    setProfile((prev) => {
      const existing = prev.courseProgress.find((c) => c.courseId === courseId);
      const next = existing
        ? prev.courseProgress.map((c) => (c.courseId === courseId ? { ...c, progress: Math.max(progress, c.progress) } : c))
        : [...prev.courseProgress, { courseId, progress }];
      return { ...prev, courseProgress: next };
    });
    try {
      const res = await api.patch<{ user: BackendProfile }>('/api/profile/course-progress', { courseId, progress });
      applyBackend(res.user);
    } catch {
      /* keep optimistic state on failure */
    }
  };

  const value: RLMContextType = {
    profile,
    isLoading,
    refreshProfile,
    selectRank,
    setRank: selectRank,
    selectBadge,
    setSubscriptionTier,
    completeArenaNode,
    submitReplay,
    purchaseExtraReplay,
    updateSheet,
    publishSheet,
    markNotificationRead,
    updateCourseProgress,
  };

  return <RLMContext.Provider value={value}>{children}</RLMContext.Provider>;
}

export function useRLM() {
  const context = useContext(RLMContext);
  if (context === undefined) {
    throw new Error('useRLM must be used within an RLMProvider');
  }
  return context;
}
