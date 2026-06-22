"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { canAccess, type ModuleKey, NAV_ITEMS } from "@/lib/permissions";

function pathToModule(pathname: string): ModuleKey | null {
  const match = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  );
  return match ? match.key : null;
}

export function AppShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const { currentUser, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.replace("/auth/login");
      return;
    }
    const moduleKey = pathToModule(pathname);
    if (moduleKey && !canAccess(currentUser.role, moduleKey)) {
      router.replace("/unauthorized");
      return;
    }
    setReady(true);
  }, [isAuthenticated, currentUser, pathname, router]);

  if (!ready || !currentUser) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={currentUser} title={title} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
