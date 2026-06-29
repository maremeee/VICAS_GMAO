"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS, canAccess } from "@/lib/permissions";
import {
  LayoutDashboard,
  Truck,
  Wrench,
  ClipboardList,
  Fuel,
  MapPin,
  Bell,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { RoleBadge } from "@/components/ui/Shared";
import { initials } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import type { User } from "@/types";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard,
  Truck,
  Wrench,
  ClipboardList,
  Fuel,
  MapPin,
  Bell,
  BarChart3,
  Shield,
};

export function Sidebar({ user }: { user: User }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const logout   = useAuthStore((s) => s.logout);

// ✅ Après
const items = NAV_ITEMS.filter((i) => canAccess((user as any).role, i.key));
  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col shrink-0 transition-all duration-200"
      style={{
        width: collapsed ? 64 : 256,
        background: "linear-gradient(180deg, #0c1d47 0%, #081333 100%)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center justify-center h-16 px-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {collapsed ? (
          /* Logo réduit quand sidebar collapse */
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
            style={{ background: "white" }}
          >
            <Image
              src="/logo.png"
              alt="VICAS"
              width={32}
              height={32}
              style={{ objectFit: "contain" }}
            />
          </div>
        ) : (
          /* Logo complet */
          <Image
            src="/logo.png"
            alt="VICAS GMAO"
            width={100}
            height={42}
            style={{ objectFit: "contain" }}
          />
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {items.map((item) => {
          const Icon   = ICONS[item.icon];
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`nav-item ${active ? "nav-item-active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Profil utilisateur ── */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {initials(
              (user as any).firstName ?? (user as any).first_name ?? "",
              (user as any).lastName  ?? (user as any).last_name  ?? ""
            )}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-white text-xs font-semibold truncate">
                {(user as any).firstName ?? (user as any).first_name}{" "}
                {(user as any).lastName  ?? (user as any).last_name}
              </p>
              <div className="mt-0.5 scale-90 origin-left">
                <RoleBadge role={(user as any).role} />
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="btn-icon shrink-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="btn-icon w-full mt-3 justify-center"
          style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}