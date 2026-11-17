import React from 'react';
import { Card } from '@shared/ui/Card';
import { cn } from '@shared/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  accent?: 'emerald' | 'amber' | 'rose' | 'sky';
}

const accentBorder: Record<NonNullable<StatCardProps['accent']>, string> = {
  emerald: 'border-l-4 border-l-emerald-500',
  amber: 'border-l-4 border-l-amber-500',
  rose: 'border-l-4 border-l-rose-500',
  sky: 'border-l-4 border-l-sky-500',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent = 'emerald',
}) => {
  return (
    <Card className={cn('p-4', accentBorder[accent])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-white tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="rounded-lg bg-slate-800/80 p-2.5 text-slate-300">
          {icon}
        </div>
      </div>
    </Card>
  );
};
