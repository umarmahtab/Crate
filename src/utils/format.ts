/**
 * Returns today's date in local YYYY-MM-DD format (preventing UTC timezone shift).
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a duration in minutes into a clean human-readable string.
 * Example: 75 -> "1h 15m", 30 -> "30m", 0 -> "0m"
 */
export function formatPlaytime(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats a date string into a user-friendly format (e.g. "Oct 12, 2024").
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'Unknown';
  try {
    const d = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Returns a relative time string (e.g., "Yesterday", "3 days ago", "Just now").
 */
export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return formatDate(dateString);
  } catch {
    return formatDate(dateString);
  }
}

/**
 * Formats rating (1-5) with descriptive label.
 */
export function formatRating(rating?: number | null): string {
  if (rating === undefined || rating === null) return 'Unrated';
  const labels: Record<number, string> = {
    1: 'Poor',
    2: 'Mediocre',
    3: 'Good',
    4: 'Great',
    5: 'Masterpiece',
  };
  return labels[rating] ? `${rating}/5 • ${labels[rating]}` : `${rating}/5`;
}

export type RankIconKey = 'crown' | 'trophy' | 'swords' | 'flame' | 'sparkles' | 'gamepad' | 'shield';

/**
 * Computes gamer rank & level based on hours played and completed games.
 * Pure vector-icon based — zero emojis.
 */
export function getGamerRank(totalMinutes: number, completedCount: number): {
  level: number;
  title: string;
  badge: string;
  iconKey: RankIconKey;
  progressPercent: number;
} {
  const totalHours = Math.floor(totalMinutes / 60);
  // Total XP: 10 XP per hour + 50 XP per completed game
  const xp = totalHours * 10 + completedCount * 50;
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 15)) + 1);
  const currentLevelBaseXP = Math.pow(level - 1, 2) * 15;
  const nextLevelBaseXP = Math.pow(level, 2) * 15;
  const progressPercent = Math.min(
    100,
    Math.round(((xp - currentLevelBaseXP) / Math.max(1, nextLevelBaseXP - currentLevelBaseXP)) * 100)
  );

  let title = 'Rookie Adventurer';
  let iconKey: RankIconKey = 'shield';

  if (level >= 30) {
    title = 'Mythic Completionist';
    iconKey = 'crown';
  } else if (level >= 20) {
    title = 'Grandmaster Collector';
    iconKey = 'trophy';
  } else if (level >= 15) {
    title = 'Hardcore Veteran';
    iconKey = 'swords';
  } else if (level >= 10) {
    title = 'Seasoned Champion';
    iconKey = 'flame';
  } else if (level >= 5) {
    title = 'Dedicated Explorer';
    iconKey = 'sparkles';
  } else if (level >= 2) {
    title = 'Active Quester';
    iconKey = 'gamepad';
  }

  return { level, title, badge: `L${level}`, iconKey, progressPercent };
}
