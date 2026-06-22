"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToastStore } from "@/lib/toast-store";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const COLORS: Record<string, string> = {
  success: "var(--success)",
  error: "var(--critical)",
  info: "var(--brand)",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            className="card card-p flex items-start gap-3 animate-fade-in shadow-lg"
            style={{ borderLeft: `3px solid ${COLORS[t.variant]}` }}
          >
            <Icon size={18} style={{ color: COLORS[t.variant] }} className="shrink-0 mt-0.5" />
            <p className="text-sm flex-1" style={{ color: "var(--foreground)" }}>
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0"
              style={{ color: "var(--muted)" }}
              aria-label="Fermer"
              type="button"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
