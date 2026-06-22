"use client";

import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  required,
  children,
  hint,
}: {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="field">
      {label && (
        <label>
          {label}
          {required && <span style={{ color: "var(--critical)" }}> *</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {hint}
        </span>
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("input", error && "input-error", className)}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }
>(({ className, error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn("input", error && "input-error", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn("input", error && "input-error", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
