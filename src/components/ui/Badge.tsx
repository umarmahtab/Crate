import React from 'react';
import type { GameStatus } from '../../types';
import { STATUS_CONFIGS, getPlatformConfig } from '../../utils/status';

export interface StatusBadgeProps {
  status: GameStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDot?: boolean;
  glow?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  glow = false,
  className = '',
}) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.backlog;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 tracking-wider uppercase font-bold',
    sm: 'text-[11px] px-2.5 py-0.5 font-semibold',
    md: 'text-xs px-3 py-1 font-semibold',
    lg: 'text-sm px-4 py-1.5 font-bold',
  }[size];

  const glowStyle = glow ? { boxShadow: `0 0 14px ${config.glowColor}` } : {};

  return (
    <span
      style={glowStyle}
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-all ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0 animate-pulse`}
        />
      )}
      <span>{config.shortLabel}</span>
    </span>
  );
};

export interface PlatformBadgeProps {
  platform: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  size = 'sm',
  className = '',
}) => {
  const config = getPlatformConfig(platform);
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-lg border backdrop-blur-sm transition-colors ${config.badgeBg} ${config.badgeBorder} ${config.badgeText} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: config.brandColor }} />
      <span>{platform}</span>
    </span>
  );
};
