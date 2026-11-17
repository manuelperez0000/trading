import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@core/theme/useThemeStore';
import { useI18n } from '@core/i18n/useLanguageStore';
import { cn } from '@shared/utils/cn';

interface ThemeToggleButtonProps {
  compact?: boolean;
  className?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  compact = false,
  className,
}) => {
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useI18n();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? t.common.lightMode : t.common.darkMode}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer',
        className
      )}
    >
      {isDark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          {!compact && <span>{t.common.lightMode}</span>}
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-sky-400" />
          {!compact && <span>{t.common.darkMode}</span>}
        </>
      )}
    </button>
  );
};
