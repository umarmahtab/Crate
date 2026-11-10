import React from 'react';
import type { RankIconKey } from '../../utils/format';
import { Crown, Trophy, Swords, Flame, Sparkles, Gamepad2, Shield } from 'lucide-react';

interface RankIconProps {
  iconKey: RankIconKey;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RankIcon: React.FC<RankIconProps> = ({
  iconKey,
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconClass = `${sizeMap[size]} ${className}`;

  switch (iconKey) {
    case 'crown':
      return <Crown className={iconClass} />;
    case 'trophy':
      return <Trophy className={iconClass} />;
    case 'swords':
      return <Swords className={iconClass} />;
    case 'flame':
      return <Flame className={iconClass} />;
    case 'sparkles':
      return <Sparkles className={iconClass} />;
    case 'gamepad':
      return <Gamepad2 className={iconClass} />;
    case 'shield':
    default:
      return <Shield className={iconClass} />;
  }
};
