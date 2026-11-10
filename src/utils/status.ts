import type { GameStatus } from '../types';

export interface StatusConfig {
  id: GameStatus;
  label: string;
  shortLabel: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  glowColor: string;
  description: string;
}

export const STATUS_CONFIGS: Record<GameStatus, StatusConfig> = {
  playing: {
    id: 'playing',
    label: 'Currently Playing',
    shortLabel: 'Playing',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/30 dark:border-emerald-500/40',
    dotColor: 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    description: 'Games you are actively playing right now',
  },
  backlog: {
    id: 'backlog',
    label: 'Backlog',
    shortLabel: 'Backlog',
    color: '#3b82f6',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    badgeText: 'text-blue-700 dark:text-blue-400',
    badgeBorder: 'border-blue-500/30 dark:border-blue-500/40',
    dotColor: 'bg-blue-500 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    description: 'Games you own and intend to play soon',
  },
  completed: {
    id: 'completed',
    label: 'Completed',
    shortLabel: 'Completed',
    color: '#f59e0b',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    badgeText: 'text-amber-700 dark:text-amber-400',
    badgeBorder: 'border-amber-500/30 dark:border-amber-500/40',
    dotColor: 'bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    description: 'Games you have finished or 100% completed',
  },
  onhold: {
    id: 'onhold',
    label: 'On Hold',
    shortLabel: 'On Hold',
    color: '#f97316',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-500/15',
    badgeText: 'text-orange-700 dark:text-orange-400',
    badgeBorder: 'border-orange-500/30 dark:border-orange-500/40',
    dotColor: 'bg-orange-500 dark:bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]',
    glowColor: 'rgba(249, 115, 22, 0.25)',
    description: 'Games paused temporarily, waiting to resume',
  },
  dropped: {
    id: 'dropped',
    label: 'Dropped',
    shortLabel: 'Dropped',
    color: '#ef4444',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    badgeText: 'text-rose-700 dark:text-rose-400',
    badgeBorder: 'border-rose-500/30 dark:border-rose-500/40',
    dotColor: 'bg-rose-500 dark:bg-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    glowColor: 'rgba(239, 68, 68, 0.25)',
    description: 'Games discontinued without intent to finish',
  },
  wishlist: {
    id: 'wishlist',
    label: 'Wishlist',
    shortLabel: 'Wishlist',
    color: '#a855f7',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    badgeText: 'text-purple-700 dark:text-purple-400',
    badgeBorder: 'border-purple-500/30 dark:border-purple-500/40',
    dotColor: 'bg-purple-500 dark:bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    description: 'Games you want to acquire and play later',
  },
};

export interface PlatformConfig {
  name: string;
  category: 'pc' | 'playstation' | 'xbox' | 'nintendo' | 'handheld' | 'mobile' | 'retro' | 'other';
  brandColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export function getPlatformConfig(platformName: string): PlatformConfig {
  const p = platformName.toLowerCase();

  if (p.includes('playstation') || p.includes('ps5') || p.includes('ps4') || p.includes('ps3') || p.includes('ps2') || p.includes('ps1')) {
    return {
      name: platformName,
      category: 'playstation',
      brandColor: '#006FCD',
      badgeBg: 'bg-blue-500/10 dark:bg-blue-600/15',
      badgeBorder: 'border-blue-500/30 dark:border-blue-500/40',
      badgeText: 'text-blue-700 dark:text-blue-300',
    };
  }
  if (p.includes('xbox')) {
    return {
      name: platformName,
      category: 'xbox',
      brandColor: '#107C10',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-600/15',
      badgeBorder: 'border-emerald-500/30 dark:border-emerald-500/40',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
    };
  }
  if (p.includes('nintendo') || p.includes('switch') || p.includes('3ds') || p.includes('wii') || p.includes('game boy') || p.includes('gba') || p.includes('ds')) {
    return {
      name: platformName,
      category: 'nintendo',
      brandColor: '#E60012',
      badgeBg: 'bg-red-500/10 dark:bg-red-600/15',
      badgeBorder: 'border-red-500/30 dark:border-red-500/40',
      badgeText: 'text-red-700 dark:text-red-300',
    };
  }
  if (p.includes('steam deck') || p.includes('rog ally') || p.includes('legion')) {
    return {
      name: platformName,
      category: 'handheld',
      brandColor: '#1a9fff',
      badgeBg: 'bg-cyan-500/10 dark:bg-cyan-600/15',
      badgeBorder: 'border-cyan-500/30 dark:border-cyan-500/40',
      badgeText: 'text-cyan-700 dark:text-cyan-300',
    };
  }
  if (p.includes('pc') || p.includes('steam') || p.includes('windows') || p.includes('mac') || p.includes('linux')) {
    return {
      name: platformName,
      category: 'pc',
      brandColor: '#4b6b94',
      badgeBg: 'bg-slate-200/90 dark:bg-slate-700/30',
      badgeBorder: 'border-slate-300 dark:border-slate-500/40',
      badgeText: 'text-slate-800 dark:text-slate-200',
    };
  }
  if (p.includes('ios') || p.includes('android')) {
    return {
      name: platformName,
      category: 'mobile',
      brandColor: '#10b981',
      badgeBg: 'bg-teal-500/10 dark:bg-teal-600/15',
      badgeBorder: 'border-teal-500/30 dark:border-teal-500/40',
      badgeText: 'text-teal-700 dark:text-teal-300',
    };
  }
  if (p.includes('retro') || p.includes('emulat')) {
    return {
      name: platformName,
      category: 'retro',
      brandColor: '#d97706',
      badgeBg: 'bg-amber-500/10 dark:bg-amber-600/15',
      badgeBorder: 'border-amber-500/30 dark:border-amber-500/40',
      badgeText: 'text-amber-700 dark:text-amber-300',
    };
  }

  return {
    name: platformName,
    category: 'other',
    brandColor: '#64748b',
    badgeBg: 'bg-slate-100 dark:bg-neutral-800',
    badgeBorder: 'border-slate-200 dark:border-neutral-700',
    badgeText: 'text-slate-700 dark:text-neutral-300',
  };
}

export const COMMON_PLATFORMS = [
  'PC',
  'PlayStation 5',
  'PlayStation 4',
  'Nintendo Switch',
  'Xbox Series X/S',
  'Xbox One',
  'Steam Deck',
  'Nintendo 3DS',
  'PlayStation 3',
  'Xbox 360',
  'Nintendo Wii / Wii U',
  'Retro / Emulation',
  'iOS',
  'Android',
  'Other',
];

export const ALL_STATUSES: GameStatus[] = [
  'playing',
  'backlog',
  'completed',
  'onhold',
  'dropped',
  'wishlist',
];
