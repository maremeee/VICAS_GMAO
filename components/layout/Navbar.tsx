"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun } from "lucide-react";
import { useDataStore } from "@/lib/data-store";
import { initials } from "@/lib/utils";
import type { User } from "@/types";
import { ROLE_LABELS } from "@/lib/permissions";

export function Navbar({ user, title }: { user: User; title?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const alerts = useDataStore((s) => s.alerts);

  useEffect(() => setMounted(true), []);

const activeAlerts = (alerts ?? []).filter((a: any) => !a.treated).length;
  return (
    <header
      className="h-16 sticky top-0 z-30 flex items-center justify-between px-5 gap-4"
      style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="min-w-0 flex items-center gap-3">
       
        {/* ── Titre de la page ── */}
        {title && (
          <p className="text-sm font-semibold truncate hidden sm:block"
            style={{ color: "var(--foreground)" }}>
            {title}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          className="btn-icon relative"
          onClick={() => router.push("/alertes")}
          aria-label="Alertes"
        >
          <Bell size={18} />
          {activeAlerts > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              style={{ background: "var(--critical)" }}
            >
              {activeAlerts}
            </span>
          )}
        </button>

        <button
          className="btn-icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Changer le thème"
        >
          {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-2"
          style={{ borderLeft: "1px solid var(--border)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--brand)", color: "white" }}
          >
            {initials((user as any).firstName ?? (user as any).first_name ?? "",
                      (user as any).lastName  ?? (user as any).last_name  ?? "")}
          </div>
          <span className="text-sm font-medium pr-1" style={{ color: "var(--foreground)" }}>
            {(user as any).firstName ?? (user as any).first_name}{" "}
            {(user as any).lastName  ?? (user as any).last_name}
          </span>
        </div>
      </div>
    </header>
  );
}