import React from 'react';
import { cn } from '@shared/utils/cn';

type ButtonVariant = 'primary' | 'danger' | 'warning' | 'secondary' | 'ghost';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  tooltip?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 active:scale-[0.99]',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-[#ffffff] font-semibold shadow-sm shadow-rose-950/50 active:scale-[0.99]',
  warning:
    'bg-amber-500 hover:bg-amber-400 text-[#020617] font-semibold',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 active:scale-[0.99]',
  ghost:
    'bg-transparent hover:bg-slate-800/70 text-slate-300 hover:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-[11px] rounded-md gap-1 leading-tight',
  sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-3.5 py-2 text-sm rounded-lg gap-2',
  lg: 'px-4 py-2.5 text-sm rounded-xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  tooltip,
  title,
  ...props
}) => {
  const tooltipText = tooltip || title;

  return (
    <button
      disabled={disabled || isLoading}
      title={tooltipText}
      className={cn(
        'group/btn relative inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
      {tooltipText && (
        <span
          role="tooltip"
          className="pointer-events-none invisible opacity-0 group-hover/btn:visible group-hover/btn:opacity-100 transition-all duration-150 absolute bottom-full right-0 mb-1.5 z-50 max-w-xs whitespace-normal text-left rounded-lg border border-amber-500/40 bg-slate-950/95 px-2.5 py-1.5 text-[11px] font-medium leading-snug text-slate-100 shadow-xl backdrop-blur-xs"
        >
          {tooltipText}
        </span>
      )}
    </button>
  );
};
