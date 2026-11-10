import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  isLoading,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-98 shadow-sm';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 gap-2 rounded-xl',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-xl font-bold',
  };

  const variantStyles = {
    primary:
      'bg-[var(--accent)] hover:brightness-110 active:brightness-95 text-neutral-950 font-bold focus:ring-[var(--accent)]/50 shadow-[0_2px_12px_rgba(0,0,0,0.15)]',
    amber:
      'bg-[var(--accent)] hover:brightness-110 active:brightness-95 text-neutral-950 font-bold focus:ring-[var(--accent)]/50 shadow-[0_2px_12px_rgba(0,0,0,0.15)]',
    secondary:
      'bg-slate-200/90 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700/90 text-slate-800 dark:text-neutral-100 border border-slate-300/80 dark:border-neutral-700/80 focus:ring-slate-400 dark:focus:ring-neutral-600',
    outline:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-neutral-800/60 text-slate-700 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700/80 focus:ring-slate-400 dark:focus:ring-neutral-600',
    danger:
      'bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 focus:ring-rose-500/50',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-neutral-800/70 text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white shadow-none',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
