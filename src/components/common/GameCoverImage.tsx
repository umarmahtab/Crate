import React, { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

interface GameCoverImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: 'vertical' | 'video' | 'square';
}

export const GameCoverImage: React.FC<GameCoverImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'vertical',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectClasses = {
    vertical: 'aspect-[3/4]',
    video: 'aspect-[16/9]',
    square: 'aspect-square',
  }[aspectRatio];

  if (!src || hasError) {
    return (
      <div
        className={`w-full ${aspectClasses} bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800 flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden relative ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-amber-500/80 mb-2">
          <Gamepad2 className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-neutral-400 line-clamp-2 px-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${aspectClasses} overflow-hidden bg-neutral-900 ${className}`}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-neutral-600 animate-pulse" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
