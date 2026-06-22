"use client";

import { AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = "danger",
  confirmLabel = "Confirmer",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: "danger" | "primary";
  confirmLabel?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box max-w-sm">
        <div className="modal-body flex flex-col items-center text-center gap-3 pt-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background:
                variant === "danger"
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(30,58,138,0.12)",
              color: variant === "danger" ? "var(--critical)" : "var(--brand)",
            }}
          >
            {variant === "danger" ? <AlertTriangle size={22} /> : <HelpCircle size={22} />}
          </div>
          <h3 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {message}
          </p>
        </div>
        <div className="modal-footer justify-center pb-5">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
