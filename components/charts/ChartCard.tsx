"use client";

import { ReactNode } from "react";

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "#0e2154",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    fontSize: 12,
    color: "#e8eeff",
    padding: "8px 14px",
    boxShadow: "0 8px 24px rgba(6,16,31,0.35)",
  },
  labelStyle: { color: "#8496bc", marginBottom: 4, fontWeight: 600 },
  itemStyle: { color: "#e8eeff" },
  cursor: { fill: "rgba(34,81,217,0.06)" },
};

export const CHART_COLORS = {
  /* Brand */
  accent:  "#f97316",
  brand:   "#2251d9",
  navy:    "#0e2154",

  /* Semantic */
  success: "#059669",
  warning: "#d97706",
  critical: "#dc2626",
  purple:  "#7c3aed",
  cyan:    "#0891b2",

  /* Chart decoration */
  grid:    "#dde4f5",
  gridDark:"#1c2e52",
};

export function ChartCard({
  title,
  subtitle,
  children,
  height = 280,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
  action?: ReactNode;
}) {
  return (
    <div className="card card-p">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}
