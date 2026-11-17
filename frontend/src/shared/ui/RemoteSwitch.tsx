import React from 'react';
import { Power, RefreshCw, ShieldAlert } from 'lucide-react';
import { useI18n } from '@core/i18n/useLanguageStore';
import { cn } from '@shared/utils/cn';

export type RemoteSyncState = 'CONFIRMED_ON' | 'PENDING_ACK' | 'CONFIRMED_OFF';

interface RemoteSwitchProps {
  isEnabled: boolean;
  syncState: RemoteSyncState;
  onToggle: () => void;
  disabled?: boolean;
  label?: string;
}

export const RemoteSwitch: React.FC<RemoteSwitchProps> = ({
  isEnabled,
  syncState,
  onToggle,
  disabled = false,
}) => {
  const { t } = useI18n();
  const isPending = syncState === 'PENDING_ACK';

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'group relative inline-flex items-center gap-2.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50',
        isPending
          ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
          : isEnabled
          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
          : 'border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
      )}
    >
      {isPending ? (
        <>
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
          <span>{t.remoteSwitch.syncing}</span>
        </>
      ) : isEnabled ? (
        <>
          <Power className="h-3.5 w-3.5 text-emerald-400" />
          <span>{t.remoteSwitch.on}</span>
        </>
      ) : (
        <>
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>{t.remoteSwitch.off}</span>
        </>
      )}
    </button>
  );
};
