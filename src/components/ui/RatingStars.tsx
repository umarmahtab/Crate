import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  value?: number | null;
  onChange?: (rating: number | null) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Mediocre',
  3: 'Good',
  4: 'Great',
  5: 'Masterpiece',
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  value = null,
  onChange,
  readOnly = false,
  size = 'md',
  showNumber = false,
  showLabel = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  const displayValue = hoverValue !== null ? hoverValue : value || 0;
  const currentLabel = displayValue > 0 ? RATING_LABELS[displayValue] : null;

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readOnly && setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue;
          return (
            <button
              type="button"
              key={star}
              disabled={readOnly}
              onClick={() => {
                if (readOnly || !onChange) return;
                if (value === star) {
                  onChange(null);
                } else {
                  onChange(star);
                }
              }}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              className={`p-0.5 transition-all rounded ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-125 active:scale-95'
              }`}
              title={readOnly ? undefined : `${star} Star: ${RATING_LABELS[star]}`}
            >
              <Star
                className={`${starSizes} transition-all duration-150 ${
                  isFilled
                    ? 'fill-[var(--accent)] text-[var(--accent)]'
                    : 'text-slate-300 dark:text-neutral-700 hover:text-slate-400 dark:hover:text-neutral-500'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono ml-0.5">
          {value ? `${value}/5` : '—'}
        </span>
      )}

      {showLabel && currentLabel && (
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 animate-in fade-in">
          {currentLabel}
        </span>
      )}
    </div>
  );
};
