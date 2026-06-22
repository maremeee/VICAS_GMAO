"use client";

import { ReactNode } from "react";
import { Search, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import { ROLE_LABELS, ROLE_BADGE_CLASS } from "@/lib/permissions";

export function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--muted)" }}
      />
      <input
        className="input"
        style={{ paddingLeft: "2.25rem" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="table-wrap">{children}</div>;
}

export function Empty({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 gap-3">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "var(--surface-2)", color: "var(--muted)" }}
      >
        {icon ?? <Inbox size={24} />}
      </div>
      <h4 className="font-semibold" style={{ color: "var(--foreground)" }}>
        {title}
      </h4>
      {description && (
        <p className="text-sm max-w-sm" style={{ color: "var(--muted)" }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
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
  );
}

export function Badge({
  color = "slate",
  children,
}: {
  color?: "green" | "blue" | "amber" | "red" | "orange" | "slate" | "purple";
  children: ReactNode;
}) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

export function RoleBadge({ role }: { role: Role }) {
  const cls = ROLE_BADGE_CLASS[role].replace("badge-", "");
  return (
    <Badge color={cls as "green" | "blue" | "amber" | "red" | "orange" | "slate" | "purple"}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}
