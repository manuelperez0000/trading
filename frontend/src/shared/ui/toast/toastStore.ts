import { create } from 'zustand';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastItem[];
  push: (item: Omit<ToastItem, 'id'>, durationMs?: number) => void;
  dismiss: (id: string) => void;
}

const MAX_VISIBLE_TOASTS = 4;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (item, durationMs = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...item, id }].slice(-MAX_VISIBLE_TOASTS),
    }));
    setTimeout(() => get().dismiss(id), durationMs);
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/**
 * API imperativa para disparar notificaciones desde cualquier capa de presentación
 * sin necesidad de hooks (ej. dentro de callbacks onSuccess de React Query).
 */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'success' }),
  danger: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'danger' }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'warning' }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'info' }),
};
