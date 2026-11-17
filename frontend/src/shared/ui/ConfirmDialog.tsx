import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { cn } from '@shared/utils/cn';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: 'danger' | 'primary';
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonRequiredMessage?: string;
  quickReasons?: readonly string[];
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

/**
 * Modal de confirmación para acciones críticas o destructivas
 * (Kill-Switch Global, desvincular hardware, etc.).
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  requireReason = false,
  reasonLabel,
  reasonPlaceholder,
  reasonRequiredMessage,
  quickReasons = [],
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setShowError(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const handleConfirm = () => {
    if (requireReason && reason.trim().length < 3) {
      setShowError(true);
      return;
    }
    onConfirm(reason.trim());
  };

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
              isDanger
                ? 'border-rose-500/40 bg-rose-500/15 text-rose-400'
                : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
            )}
          >
            {isDanger ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <div className="space-y-1">
            <h2
              id="confirm-dialog-title"
              className="text-base font-bold text-white"
            >
              {title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {requireReason && (
          <div className="mt-5 space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              {reasonLabel}
            </label>

            {quickReasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {quickReasons.map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => {
                      setReason(quick);
                      setShowError(false);
                    }}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                      reason === quick
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                        : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                    )}
                  >
                    {quick}
                  </button>
                ))}
              </div>
            )}

            <textarea
              rows={2}
              autoFocus
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setShowError(false);
              }}
              placeholder={reasonPlaceholder}
              className={cn(
                'w-full rounded-lg border bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:outline-none',
                showError
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-700 focus:border-emerald-500'
              )}
            />
            {showError && (
              <p className="text-xs text-rose-400">{reasonRequiredMessage}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
