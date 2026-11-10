import React from 'react';
import type { GameStatus } from '../../types';
import { ALL_STATUSES, STATUS_CONFIGS } from '../../utils/status';

interface StatusSelectProps {
  value: GameStatus;
  onChange: (status: GameStatus) => void;
  className?: string;
  variant?: 'pills' | 'select' | 'segmented';
}

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  className = '',
  variant = 'pills',
}) => {
  if (variant === 'select') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as GameStatus)}
        className={`bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 shadow-sm ${className}`}
      >
        {ALL_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_CONFIGS[status].label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {ALL_STATUSES.map((status) => {
        const config = STATUS_CONFIGS[status];
        const isSelected = value === status;
        return (
          <button
            type="button"
            key={status}
            onClick={() => onChange(status)}
            style={isSelected ? { boxShadow: `0 0 12px ${config.glowColor}` } : {}}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-2 active:scale-95 shadow-sm ${
              isSelected
                ? `${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ring-1 ring-inset ring-current`
                : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${config.dotColor} ${
                isSelected ? 'opacity-100' : 'opacity-40'
              }`}
            />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};
