"use client";

import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { ROLE_LABELS, ROLE_DEFAULT_PAGE } from "@/lib/permissions";
import { RoleBadge } from "@/components/ui/Shared";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function UnauthorizedPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);

  return (
    <div className={styles.wrapper}>
      <div className={styles.box}>
        <div className={styles.iconBox}>
          <Lock size={28} />
        </div>

        <h1 className={styles.title}>Accès non autorisé</h1>
        <p className={styles.sub}>
          Vous n&apos;avez pas la permission d&apos;accéder à cette page avec
          votre rôle actuel.
        </p>

        {currentUser && (
          <div className={styles.roleRow}>
            <RoleBadge role={currentUser.role} />
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft size={16} />
            Retour
          </Button>
          {currentUser && (
            <Button
              variant="orange"
              onClick={() => router.push(ROLE_DEFAULT_PAGE[currentUser.role])}
            >
              Aller à mon tableau de bord
            </Button>
          )}
        </div>

        {currentUser && (
          <p className="text-xs mt-5 text-center" style={{ color: "var(--muted)" }}>
            {ROLE_LABELS[currentUser.role]}
          </p>
        )}
      </div>
    </div>
  );
}
