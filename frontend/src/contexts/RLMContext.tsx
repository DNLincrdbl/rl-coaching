'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { IconType } from 'react-icons';
import { FaMedal, FaCog, FaRocket, FaBullseye, FaCrown } from 'react-icons/fa';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { CoachingSheet } from '@/lib/data/coaching';
import { ArenaBadge } from '@/lib/data/arenaBadges';

export type SubscriptionTier = 'rlm' | 'rlm_plus';
export type ArenaTreeId = 'dribble' | 'aerial';

export const COMMUNITY_UNLOCK_THRESHOLD = 15;
export const LEADERBOARD_UNLOCK_THRESHOLD = 20;
export const EXTRA_REPLAY_PRICE = 5990;
export const FEEDBACK_XP = 1000;

export function isRlmPlus(tier: string | null | undefined): boolean {
  return tier === 'rlm_plus' || tier === 'pro';
}

export function normalizeTier(tier: string | null | undefined): SubscriptionTier {
  return isRlmPlus(tier) ? 'rlm_plus' : 'rlm';
}

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

/** XP needed to go from `level` to `level + 1` (lvl 1→2 = 700, then +100/level). */
export function xpRequiredForLevel(level: number): number {
  return 700 + Math.max(0, level - 1) * 100;
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level++;
    if (level > 200) break;
  }
  return level;
}

export function getXPProgressInLevel(xp: number): { current: number; required: number; level: number } {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level++;
    if (level > 200) break;
  }
  return { current: remaining, required: xpRequiredForLevel(level), level };
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
export interface PlatformFeatures {
  memberCount: number;
  communityUnlockThreshold: number;
  leaderboardUnlockThreshold: number;
  communityUnlocked: boolean;
  leaderboardUnlocked: boolean;
  isRlmPlus: boolean;
  canAccessReplayFeed: boolean;
}

export interface PendingShareSheet {
  id: string;
  title: string;
  published: boolean;
}

export interface RLMProfile {
  id: number | null;
  rank: string | null;
  level: number;
  xp: number;
  subscriptionTier: SubscriptionTier;
  coachingCredits: number;
  extraReplayCredits: number;
  selectedBadge: string | null;
  selectedTitle: string | null;
  avatarColor: string;
  unlockedTitles: string[];
  unlockedColors: string[];
  nextLevelColor: { id: string; hex: string; name: string } | null;
  discordUsername: string | null;
  discordLinked: boolean;
  emailVerified: boolean;
  email: string;
  username: string;
  pendingEmail: string | null;
  autoPublishSheets: boolean;
  hideAutoSharePrompt: boolean;
  pendingShareSheet: PendingShareSheet | null;
  arenaProgress: Record<ArenaTreeId, string[]>;
  arenaBadges: ArenaBadge[];
  arenaBadge: ArenaBadge | null;
  discordCoaching: boolean;
  coachingSheets: CoachingSheet[];
  notifications: RLMNotification[];
  submissions: ReplaySubmission[];
  joinedAt: string;
  hasSelectedRank: boolean;
  rlmPurchased: boolean;
  courseProgress: CourseProgress[];
  features: PlatformFeatures;
}

interface BackendProfile {
  id: number;
  rank: string | null;
  level: number;
  xp: number;
  subscriptionTier: string;
  coachingCredits: number;
  extraReplayCredits: number;
  selectedBadge: string | null;
  selectedTitle?: string | null;
  avatarColor?: string;
  unlockedTitles?: string[];
  unlockedColors?: string[];
  nextLevelColor?: { id: string; hex: string; name: string } | null;
  discordUsername?: string | null;
  discordLinked?: boolean;
  emailVerified?: boolean;
  email?: string;
  username?: string;
  pendingEmail?: string | null;
  autoPublishSheets?: boolean;
  hideAutoSharePrompt?: boolean;
  pendingShareSheet?: PendingShareSheet | null;
  arenaProgress: Record<ArenaTreeId, string[]>;
  arenaBadges?: ArenaBadge[];
  arenaBadge?: ArenaBadge | null;
  discordCoaching: boolean;
  coachingSheets: CoachingSheet[];
  notifications: RLMNotification[];
  submissions: ReplaySubmission[];
  courseProgress?: CourseProgress[];
  createdAt: string;
  features?: PlatformFeatures;
}

const EMPTY_FEATURES: PlatformFeatures = {
  memberCount: 0,
  communityUnlockThreshold: COMMUNITY_UNLOCK_THRESHOLD,
  leaderboardUnlockThreshold: LEADERBOARD_UNLOCK_THRESHOLD,
  communityUnlocked: false,
  leaderboardUnlocked: false,
  isRlmPlus: false,
  canAccessReplayFeed: false,
};

const EMPTY_PROFILE: RLMProfile = {
  id: null,
  rank: null,
  level: 1,
  xp: 0,
  subscriptionTier: 'rlm',
  coachingCredits: 0,
  extraReplayCredits: 0,
  selectedBadge: 'rookie',
  selectedTitle: null,
  avatarColor: 'black',
  unlockedTitles: [],
  unlockedColors: ['black'],
  nextLevelColor: null,
  discordUsername: null,
  discordLinked: false,
  emailVerified: true,
  email: '',
  username: '',
  pendingEmail: null,
  autoPublishSheets: true,
  hideAutoSharePrompt: false,
  pendingShareSheet: null,
  arenaProgress: { dribble: [], aerial: [] },
  arenaBadges: [],
  arenaBadge: null,
  discordCoaching: true,
  coachingSheets: [],
  notifications: [],
  submissions: [],
  joinedAt: new Date().toISOString(),
  hasSelectedRank: false,
  rlmPurchased: true,
  courseProgress: [],
  features: EMPTY_FEATURES,
};

function mapProfile(bp: BackendProfile): RLMProfile {
  const tier = normalizeTier(bp.subscriptionTier);
  return {
    id: bp.id,
    rank: bp.rank,
    level: bp.level,
    xp: bp.xp,
    subscriptionTier: tier,
    coachingCredits: bp.coachingCredits,
    extraReplayCredits: bp.extraReplayCredits,
    selectedBadge: bp.selectedBadge,
    selectedTitle: bp.selectedTitle ?? null,
    avatarColor: bp.avatarColor || 'black',
    unlockedTitles: bp.unlockedTitles ?? [],
    unlockedColors: bp.unlockedColors ?? ['black'],
    nextLevelColor: bp.nextLevelColor ?? null,
    discordUsername: bp.discordUsername ?? null,
    discordLinked: Boolean(bp.discordLinked),
    emailVerified: bp.emailVerified !== false,
    email: bp.email || '',
    username: bp.username || '',
    pendingEmail: bp.pendingEmail ?? null,
    autoPublishSheets: bp.autoPublishSheets ?? true,
    hideAutoSharePrompt: bp.hideAutoSharePrompt ?? false,
    pendingShareSheet: bp.pendingShareSheet ?? null,
    arenaProgress: {
      dribble: bp.arenaProgress?.dribble ?? [],
      aerial: bp.arenaProgress?.aerial ?? [],
    },
    arenaBadges: bp.arenaBadges ?? [],
    arenaBadge: bp.arenaBadge ?? null,
    discordCoaching: bp.discordCoaching,
    coachingSheets: bp.coachingSheets ?? [],
    notifications: bp.notifications ?? [],
    submissions: bp.submissions ?? [],
    joinedAt: bp.createdAt,
    hasSelectedRank: Boolean(bp.rank),
    rlmPurchased: true,
    courseProgress: bp.courseProgress ?? [],
    features: bp.features ?? { ...EMPTY_FEATURES, isRlmPlus: isRlmPlus(tier) },
  };
}

interface RLMContextType {
  profile: RLMProfile;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  selectRank: (rank: string) => Promise<void>;
  setRank: (rank: string) => Promise<void>;
  completeOnboarding: (payload: { rank: string; discordUsername?: string }) => Promise<void>;
  selectBadge: (badgeId: string) => Promise<void>;
  updateCosmetics: (payload: {
    selectedBadge?: string | null;
    selectedTitle?: string | null;
    avatarColor?: string;
  }) => Promise<void>;
  updateSettings: (payload: { autoPublishSheets?: boolean; hideAutoSharePrompt?: boolean }) => Promise<void>;
  dismissSharePrompt: (dontShowAgain?: boolean) => Promise<void>;
  setSubscriptionTier: (tier: SubscriptionTier) => Promise<void>;
  submitArenaMission: (tree: ArenaTreeId, slot: string, payload?: { note?: string; video?: File | null }) => Promise<void>;
  claimArenaReward: (payload: { tree: ArenaTreeId; slot: string }) => Promise<{ xp: number; badge: ArenaBadge | null }>;
  submitReplay: (payload: { video: File; note?: string; useDiscord: boolean }) => Promise<void>;
  purchaseExtraReplay: () => Promise<void>;
  updateSheet: (sheet: CoachingSheet) => Promise<void>;
  publishSheet: (sheetId: string, published: boolean) => Promise<CoachingSheet>;
  submitSheetFeedback: (sheetId: string, payload: { stars: number; message: string; tip: number }) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  updateCourseProgress: (courseId: string, progress: number) => Promise<void>;
  reportIssue: (message: string, page?: string) => Promise<void>;
}

const RLMContext = createContext<RLMContextType | undefined>(undefined);

export function RLMProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<RLMProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const readyRef = React.useRef(false);

  const applyBackend = useCallback((bp: BackendProfile) => {
    setProfile((prev) => {
      const next = mapProfile(bp);
      if (readyRef.current && prev.id) {
        const dx = next.xp - prev.xp;
        if (dx > 0) showToast(`+${dx} XP`, 'success');
        if (next.level > prev.level) showToast(`Szint ${next.level}!`, 'success');
        if (prev.subscriptionTier !== 'rlm_plus' && next.subscriptionTier === 'rlm_plus') {
          showToast('RLM+ aktiválva a fiókodon.', 'success');
        }
      }
      return next;
    });
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
      readyRef.current = true;
    })();
    const onRefresh = () => { void refreshProfile(); };
    window.addEventListener('rlm-profile-refresh', onRefresh);
    return () => window.removeEventListener('rlm-profile-refresh', onRefresh);
  }, [refreshProfile]);

  const selectRank = async (rank: string) => {
    const res = await api.patch<{ user: BackendProfile }>('/api/profile', { rank });
    applyBackend(res.user);
  };

  const completeOnboarding = async (payload: { rank: string; discordUsername?: string }) => {
    const res = await api.patch<{ user: BackendProfile }>('/api/profile', {
      rank: payload.rank,
      discordUsername: payload.discordUsername ?? '',
    });
    applyBackend(res.user);
  };

  const selectBadge = async (badgeId: string) => {
    const res = await api.patch<{ user: BackendProfile }>('/api/profile', { selectedBadge: badgeId });
    applyBackend(res.user);
  };

  const updateCosmetics = async (payload: {
    selectedBadge?: string | null;
    selectedTitle?: string | null;
    avatarColor?: string;
  }) => {
    const res = await api.patch<{ user: BackendProfile }>('/api/profile', payload);
    applyBackend(res.user);
  };

  const updateSettings = async (payload: { autoPublishSheets?: boolean; hideAutoSharePrompt?: boolean }) => {
    const res = await api.patch<{ user: BackendProfile }>('/api/profile', payload);
    applyBackend(res.user);
  };

  const dismissSharePrompt = async (dontShowAgain = false) => {
    const res = await api.post<{ user: BackendProfile }>('/api/profile/dismiss-share', { dontShowAgain });
    applyBackend(res.user);
  };

  const setSubscriptionTier = async (tier: SubscriptionTier) => {
    const res = await api.post<{ user: BackendProfile }>('/api/billing/demo-complete', {
      items: [{ id: tier === 'rlm_plus' ? 'sub-rlm_plus' : 'sub-rlm', qty: 1 }],
    });
    applyBackend(res.user);
  };

  const submitArenaMission = async (
    tree: ArenaTreeId,
    slot: string,
    payload?: { note?: string; video?: File | null },
  ) => {
    const form = new FormData();
    form.append('tree', tree);
    form.append('slot', slot);
    form.append('note', payload?.note ?? '');
    if (payload?.video) form.append('video', payload.video);
    const res = await api.postForm<{ user: BackendProfile }>('/api/arena/submit', form);
    applyBackend(res.user);
  };

  const claimArenaReward = async (payload: { tree: ArenaTreeId; slot: string }) => {
    const res = await api.post<{ user: BackendProfile; reward: { xp: number; badge: ArenaBadge | null } }>(
      '/api/arena/claim',
      payload,
    );
    applyBackend(res.user);
    return { xp: res.reward?.xp ?? 0, badge: res.reward?.badge ?? null };
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

  const submitSheetFeedback = async (sheetId: string, payload: { stars: number; message: string; tip: number }) => {
    const res = await api.post<{ sheet: CoachingSheet; user: BackendProfile }>(`/api/sheets/${sheetId}/feedback`, payload);
    applyBackend(res.user);
  };

  const reportIssue = async (message: string, page?: string) => {
    await api.post('/api/issues', { message, page });
  };

  const markNotificationRead = async (notificationId: string) => {
    setProfile((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    }));
    try {
      await api.post(`/api/profile/notifications/${notificationId}/read`);
    } catch {
      setProfile((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === notificationId ? { ...n, read: false } : n)),
      }));
    }
  };

  const updateCourseProgress = async (courseId: string, progress: number) => {
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
      await refreshProfile();
      showToast('A kurzus haladás mentése nem sikerült.');
    }
  };

  const value: RLMContextType = {
    profile,
    isLoading,
    refreshProfile,
    selectRank,
    setRank: selectRank,
    completeOnboarding,
    selectBadge,
    updateCosmetics,
    updateSettings,
    dismissSharePrompt,
    setSubscriptionTier,
    submitArenaMission,
    claimArenaReward,
    submitReplay,
    purchaseExtraReplay,
    updateSheet,
    publishSheet,
    submitSheetFeedback,
    markNotificationRead,
    updateCourseProgress,
    reportIssue,
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
