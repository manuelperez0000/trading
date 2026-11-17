import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '@core/i18n/useLanguageStore';
import { cn } from '@shared/utils/cn';

interface LanguageSwitcherButtonProps {
  className?: string;
}

export const LanguageSwitcherButton: React.FC<LanguageSwitcherButtonProps> = ({
  className,
}) => {
  const { lang, toggleLanguage } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={
        lang === 'es'
          ? 'Switch language to English (EN)'
          : 'Cambiar idioma a Español (ES)'
      }
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer',
        className
      )}
    >
      <Globe className="h-3.5 w-3.5 text-emerald-400" />
      <span className="font-mono uppercase">{lang === 'es' ? 'ES' : 'EN'}</span>
      <span className="text-slate-500">|</span>
      <span className="text-[11px] text-slate-400">
        {lang === 'es' ? 'EN' : 'ES'}
      </span>
    </button>
  );
};
