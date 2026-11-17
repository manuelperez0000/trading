import React from 'react';
import { cn } from '@shared/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-800/90 bg-slate-900/70 backdrop-blur-sm shadow-lg shadow-black/20',
        className
      )}
    >
      {children}
    </div>
  );
};
