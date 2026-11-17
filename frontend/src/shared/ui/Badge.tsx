import React from 'react';
import { cn } from '@shared/utils/cn';

export type BadgeVariant =
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'sky'
  | 'violet'
  | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  emerald:
    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber:
    'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rose:
    'bg-rose-500/15 text-rose-300 border-rose-500/30',
  sky:
    'bg-sky-500/15 text-sky-300 border-sky-500/30',
  violet:
    'bg-violet-500/15 text-violet-300 border-violet-500/30',
  slate:
    'bg-slate-800/80 text-slate-300 border-slate-700',
};

const dotStyles: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  sky: 'bg-sky-400',
  violet: 'bg-violet-400',
  slate: 'bg-slate-400',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  pulse = false,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              dotStyles[variant]
            )}
          />
          <span
            className={cn(
              'relative inline-flex h-2 w-2 rounded-full',
              dotStyles[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
};
