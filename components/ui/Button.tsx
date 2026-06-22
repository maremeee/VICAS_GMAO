"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "orange" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  orange: "btn-orange",
  ghost: "btn-ghost",
  outline: "btn-outline",
  danger: "btn-danger",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    if (size === "icon") {
      return (
        <button
          ref={ref}
          className={cn("btn-icon", className)}
          {...props}
        />
      );
    }
    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          variantClass[variant],
          size === "sm" && "text-xs py-1.5 px-3",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
