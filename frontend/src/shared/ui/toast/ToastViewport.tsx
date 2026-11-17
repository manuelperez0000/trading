import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import {
  useToastStore,
  type ToastVariant,
} from '@shared/ui/toast/toastStore';

const variantStyles: Record<
  ToastVariant,
  { border: string; icon: React.ReactNode }
> = {
  success: {
    border: 'border-l-emerald-500',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
  },
  danger: {
    border: 'border-l-rose-500',
    icon: <XCircle className="h-5 w-5 text-rose-400" />,
  },
  warning: {
    border: 'border-l-amber-500',
    icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
  },
  info: {
    border: 'border-l-sky-500',
    icon: <Info className="h-5 w-5 text-sky-400" />,
  },
};

export const ToastViewport: React.FC = () => {
  const { toasts, dismiss } = useToastStore();

  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            'toast-enter pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-800 border-l-4 bg-slate-900 p-3.5 shadow-xl shadow-black/30',
            variantStyles[item.variant].border
          )}
        >
          <div className="shrink-0 mt-0.5">
            {variantStyles[item.variant].icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{item.title}</p>
            {item.description && (
              <p className="mt-0.5 text-xs text-slate-400 break-words">
                {item.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
