import { create } from "zustand";

export interface ToastItem {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, variant?: ToastItem["variant"]) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, variant = "success") => {
    const id = `t_${Math.random().toString(36).slice(2, 9)}`;
    set({ toasts: [...get().toasts, { id, message, variant }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3500);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
