"use client";

import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type ColorVariant = "navy" | "orange" | "green" | "amber" | "red" | "blue";

/* Soft gradient backgrounds + matching foreground for each variant */
const colorMap: Record<ColorVariant, { bg: string; fg: string }> = {
  navy: {
    bg: "linear-gradient(135deg, rgba(14,33,84,0.10) 0%, rgba(34,81,217,0.07) 100%)",
    fg: "var(--navy)",
  },
  blue: {
    bg: "linear-gradient(135deg, rgba(34,81,217,0.11) 0%, rgba(59,130,246,0.07) 100%)",
    fg: "var(--brand)",
  },
  orange: {
    bg: "linear-gradient(135deg, rgba(249,115,22,0.13) 0%, rgba(251,147,56,0.08) 100%)",
    fg: "var(--accent)",
  },
  green: {
    bg: "linear-gradient(135deg, rgba(5,150,105,0.12) 0%, rgba(16,185,129,0.08) 100%)",
    fg: "var(--success)",
  },
  amber: {
    bg: "linear-gradient(135deg, rgba(217,119,6,0.12) 0%, rgba(245,158,11,0.08) 100%)",
    fg: "var(--warning)",
  },
  red: {
    bg: "linear-gradient(135deg, rgba(220,38,38,0.12) 0%, rgba(239,68,68,0.07) 100%)",
    fg: "var(--critical)",
  },
};

export function StatCard({
  title,
  value,
  icon,
  color = "navy",
  trend,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: ColorVariant;
  trend?: { value: number; label?: string };
}) {
  const c = colorMap[color];
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          {title}
        </span>
        {icon && (
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: c.bg, color: c.fg }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          {value}
        </span>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-xs font-semibold mb-1"
            style={{
              color: trend.value >= 0 ? "var(--success)" : "var(--critical)",
            }}
          >
            {trend.value >= 0 ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
