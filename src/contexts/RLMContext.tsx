'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Rocket League Ranks
export const RL_RANKS = [
  'Bronze I', 'Bronze II', 'Bronze III',
  'Silver I', 'Silver II', 'Silver III',
  'Gold I', 'Gold II', 'Gold III',
  'Platinum I', 'Platinum II', 'Platinum III',
  'Diamond I', 'Diamond II', 'Diamond III',
  'Champion I', 'Champion II', 'Champion III',
  'Grand Champion I', 'Grand Champion II', 'Grand Champion III',
  'Supersonic Legend'
];

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number; // 1-5
  unlocked: boolean;
  unlockedAt?: Date;
}

// Inventory item types
export type ItemType = 'profile_picture' | 'profile_banner' | 'badge' | 'coaching' | 'replay_analysis' | 'common_game';

export interface InventoryItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  image?: string;
  equipped?: boolean;
  used?: boolean;
  receivedAt: Date;
  // For replay analysis returns
  adminResponse?: string;
  replayFile?: string;
}

// Mission types
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';

export interface Mission {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  difficulty: MissionDifficulty;
  completed: boolean;
  rerolled: boolean;
  forBadge?: boolean; // One of the 5 special badge missions
}

// Shop item
export interface ShopItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  image?: string;
  boostCost: number;
  revealed: boolean;
}

// Course progress
export interface CourseProgress {
  courseId: string;
  progress: number; // 0-100
  lastWatched?: Date;
}

// Notification
export interface RLMNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

// Submission types
export interface Submission {
  id: string;
  type: 'mission' | 'replay_analysis';
  missionId?: string;
  file?: File;
  status: 'pending' | 'approved' | 'rejected';
  adminFeedback?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

// User RLM Profile
export interface RLMProfile {
  rank: string | null;
  level: number;
  xp: number;
  boost: number;
  hasSelectedRank: boolean;
  rlmPurchased: boolean;
  inventory: InventoryItem[];
  equippedProfilePicture: string | null;
  equippedProfileBanner: string | null;
  badges: Badge[];
  completedMissions: string[];
  courseProgress: CourseProgress[];
  notifications: RLMNotification[];
  submissions: Submission[];
  missionPassProgress: number; // 0-11
  joinedAt: Date;
  shopLastRefresh: Date;
  weeklyShopItems: ShopItem[];
}

// XP calculation functions
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  // Level 2 = 100 XP, then +10 each level
  return 100 + (level - 2) * 10;
}

export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  let requiredXP = 100;
  let totalXP = 0;
  
  while (totalXP + requiredXP <= xp) {
    totalXP += requiredXP;
    level++;
    requiredXP = 100 + (level - 1) * 10;
  }
  
  return level;
}

export function getXPProgressInLevel(xp: number): { current: number; required: number } {
  const level = getLevelFromXP(xp);
  const totalXPForCurrentLevel = getTotalXPForLevel(level);
  const xpInCurrentLevel = xp - totalXPForCurrentLevel;
  const requiredForNext = getXPForLevel(level + 1);
  
  return { current: xpInCurrentLevel, required: requiredForNext };
}

// Mission Pass boost rewards
export const MISSION_PASS_REWARDS = [10, 10, 20, 20, 30, 30, 40, 40, 50, 50, 60];

// Shop prices
export const SHOP_PRICES = {
  replay_analysis: 300,
  common_game: 400,
  coaching: 600,
};

interface RLMContextType {
  profile: RLMProfile;
  isLoading: boolean;
  // Actions
  selectRank: (rank: string) => void;
  addXP: (amount: number) => void;
  addBoost: (amount: number) => void;
  spendBoost: (amount: number) => boolean;
  equipItem: (itemId: string) => void;
  unequipItem: (itemType: ItemType) => void;
  purchaseItem: (item: ShopItem) => boolean;
  purchaseShopItem: (itemType: 'replay_analysis' | 'common_game' | 'coaching') => boolean;
  completeMission: (missionId: string) => void;
  rerollMission: (missionId: string) => void;
  submitReplay: (type: 'mission' | 'replay_analysis', file: File, missionId?: string) => void;
  revealShopItem: (itemId: string) => void;
  updateCourseProgress: (courseId: string, progress: number) => void;
  markNotificationRead: (notificationId: string) => void;
  addNotification: (message: string, type: RLMNotification['type']) => void;
  refreshWeeklyShop: () => void;
  claimMissionPassReward: (tier: number) => void;
}

const defaultProfile: RLMProfile = {
  rank: null,
  level: 1,
  xp: 0,
  boost: 0,
  hasSelectedRank: false,
  rlmPurchased: true, // For demo purposes, set to true
  inventory: [],
  equippedProfilePicture: null,
  equippedProfileBanner: null,
  badges: [
    { id: 'badge-1', name: 'Aerial Master', description: 'Complete all aerial challenges', icon: '🚀', level: 0, unlocked: false },
    { id: 'badge-2', name: 'Wall Wizard', description: 'Master wall plays', icon: '🧱', level: 0, unlocked: false },
    { id: 'badge-3', name: 'Rotation King', description: 'Perfect rotation fundamentals', icon: '🔄', level: 0, unlocked: false },
    { id: 'badge-4', name: 'Boost Demon', description: 'Boost management excellence', icon: '⚡', level: 0, unlocked: false },
    { id: 'badge-5', name: 'Mechanical God', description: 'Advanced mechanics mastery', icon: '⚙️', level: 0, unlocked: false },
  ],
  completedMissions: [],
  courseProgress: [],
  notifications: [],
  submissions: [],
  missionPassProgress: 0,
  joinedAt: new Date(),
  shopLastRefresh: new Date(),
  weeklyShopItems: [],
};

const RLMContext = createContext<RLMContextType | undefined>(undefined);

export function RLMProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<RLMProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rlm-profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        parsed.joinedAt = new Date(parsed.joinedAt);
        parsed.shopLastRefresh = new Date(parsed.shopLastRefresh);
        setProfile(parsed);
      } catch (e) {
        console.error('Failed to parse RLM profile:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save profile to localStorage on change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('rlm-profile', JSON.stringify(profile));
    }
  }, [profile, isLoading]);

  // Check if weekly shop needs refresh
  useEffect(() => {
    const now = new Date();
    const lastRefresh = new Date(profile.shopLastRefresh);
    const daysSinceRefresh = Math.floor((now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceRefresh >= 7) {
      refreshWeeklyShop();
    }
  }, []);

  const selectRank = (rank: string) => {
    setProfile(prev => ({
      ...prev,
      rank,
      hasSelectedRank: true,
    }));
  };

  const addXP = (amount: number) => {
    setProfile(prev => {
      const newXP = prev.xp + amount;
      const newLevel = getLevelFromXP(newXP);
      const leveledUp = newLevel > prev.level;
      const boostGained = leveledUp ? (newLevel - prev.level) * 10 : 0;
      
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        boost: prev.boost + boostGained,
      };
    });
  };

  const addBoost = (amount: number) => {
    setProfile(prev => ({
      ...prev,
      boost: prev.boost + amount,
    }));
  };

  const spendBoost = (amount: number): boolean => {
    if (profile.boost < amount) return false;
    setProfile(prev => ({
      ...prev,
      boost: prev.boost - amount,
    }));
    return true;
  };

  const equipItem = (itemId: string) => {
    setProfile(prev => {
      const item = prev.inventory.find(i => i.id === itemId);
      if (!item) return prev;

      const newInventory = prev.inventory.map(i => {
        if (i.type === item.type) {
          return { ...i, equipped: i.id === itemId };
        }
        return i;
      });

      return {
        ...prev,
        inventory: newInventory,
        equippedProfilePicture: item.type === 'profile_picture' ? item.image || null : prev.equippedProfilePicture,
        equippedProfileBanner: item.type === 'profile_banner' ? item.image || null : prev.equippedProfileBanner,
      };
    });
  };

  const unequipItem = (itemType: ItemType) => {
    setProfile(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => 
        i.type === itemType ? { ...i, equipped: false } : i
      ),
      equippedProfilePicture: itemType === 'profile_picture' ? null : prev.equippedProfilePicture,
      equippedProfileBanner: itemType === 'profile_banner' ? null : prev.equippedProfileBanner,
    }));
  };

  const purchaseItem = (item: ShopItem): boolean => {
    if (profile.boost < item.boostCost) return false;
    
    setProfile(prev => ({
      ...prev,
      boost: prev.boost - item.boostCost,
      inventory: [...prev.inventory, {
        id: `inv-${Date.now()}`,
        type: item.type,
        name: item.name,
        description: item.description,
        image: item.image,
        equipped: false,
        receivedAt: new Date(),
      }],
      weeklyShopItems: prev.weeklyShopItems.filter(i => i.id !== item.id),
    }));
    return true;
  };

  const purchaseShopItem = (itemType: 'replay_analysis' | 'common_game' | 'coaching'): boolean => {
    const cost = SHOP_PRICES[itemType];
    if (profile.boost < cost) return false;

    const itemNames = {
      replay_analysis: 'Replay Elemzés',
      common_game: 'Közös Játék',
      coaching: 'Coaching',
    };

    setProfile(prev => ({
      ...prev,
      boost: prev.boost - cost,
      inventory: [...prev.inventory, {
        id: `inv-${Date.now()}`,
        type: itemType,
        name: itemNames[itemType],
        description: `Beváltható ${itemNames[itemType]}`,
        equipped: false,
        used: false,
        receivedAt: new Date(),
      }],
    }));
    return true;
  };

  const completeMission = (missionId: string) => {
    setProfile(prev => ({
      ...prev,
      completedMissions: [...prev.completedMissions, missionId],
    }));
  };

  const rerollMission = (missionId: string) => {
    // Implementation for rerolling a mission
  };

  const submitReplay = (type: 'mission' | 'replay_analysis', file: File, missionId?: string) => {
    const submission: Submission = {
      id: `sub-${Date.now()}`,
      type,
      missionId,
      status: 'pending',
      submittedAt: new Date(),
    };

    setProfile(prev => ({
      ...prev,
      submissions: [...prev.submissions, submission],
    }));

    addNotification('Beküldésed sikeresen megérkezett! Hamarosan értesítünk az eredményről.', 'success');
  };

  const revealShopItem = (itemId: string) => {
    setProfile(prev => ({
      ...prev,
      weeklyShopItems: prev.weeklyShopItems.map(item =>
        item.id === itemId ? { ...item, revealed: true } : item
      ),
    }));
  };

  const updateCourseProgress = (courseId: string, progress: number) => {
    setProfile(prev => {
      const existing = prev.courseProgress.find(c => c.courseId === courseId);
      if (existing) {
        return {
          ...prev,
          courseProgress: prev.courseProgress.map(c =>
            c.courseId === courseId ? { ...c, progress, lastWatched: new Date() } : c
          ),
        };
      }
      return {
        ...prev,
        courseProgress: [...prev.courseProgress, { courseId, progress, lastWatched: new Date() }],
      };
    });
  };

  const markNotificationRead = (notificationId: string) => {
    setProfile(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  };

  const addNotification = (message: string, type: RLMNotification['type']) => {
    const notification: RLMNotification = {
      id: `notif-${Date.now()}`,
      message,
      type,
      read: false,
      createdAt: new Date(),
    };

    setProfile(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications],
    }));
  };

  const refreshWeeklyShop = () => {
    // Generate 5 random mystery items
    const itemTypes: ItemType[] = ['profile_picture', 'profile_banner'];
    const mysteryItems: ShopItem[] = Array.from({ length: 5 }, (_, i) => ({
      id: `shop-${Date.now()}-${i}`,
      type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
      name: `Rejtélyes Tárgy #${i + 1}`,
      description: 'Kattints a felfedéshez!',
      image: `/mystery-${i + 1}.png`,
      boostCost: Math.floor(Math.random() * 100) + 50,
      revealed: false,
    }));

    setProfile(prev => ({
      ...prev,
      weeklyShopItems: mysteryItems,
      shopLastRefresh: new Date(),
    }));
  };

  const claimMissionPassReward = (tier: number) => {
    if (tier <= profile.missionPassProgress) return;
    
    const reward = MISSION_PASS_REWARDS[tier - 1];
    setProfile(prev => ({
      ...prev,
      missionPassProgress: tier,
      boost: prev.boost + reward,
    }));
  };

  const value: RLMContextType = {
    profile,
    isLoading,
    selectRank,
    addXP,
    addBoost,
    spendBoost,
    equipItem,
    unequipItem,
    purchaseItem,
    purchaseShopItem,
    completeMission,
    rerollMission,
    submitReplay,
    revealShopItem,
    updateCourseProgress,
    markNotificationRead,
    addNotification,
    refreshWeeklyShop,
    claimMissionPassReward,
  };

  return (
    <RLMContext.Provider value={value}>
      {children}
    </RLMContext.Provider>
  );
}

export function useRLM() {
  const context = useContext(RLMContext);
  if (context === undefined) {
    throw new Error('useRLM must be used within an RLMProvider');
  }
  return context;
}
