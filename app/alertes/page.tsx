"use client";

import styles from "./page.module.css";

import { useMemo, useState } from "react";
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Truck,
  Calendar,
  Gauge,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Empty, Badge } from "@/components/ui/Shared";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { useToastStore } from "@/lib/toast-store";
import { canTreatAlert } from "@/lib/permissions";
import {
  ALERT_LEVEL_BADGE,
  ALERT_LEVEL_BORDER,
  ALERT_LEVEL_LABELS,
  ALERT_TYPE_LABELS,
} from "@/lib/labels";
import { formatDate, daysUntil } from "@/lib/utils";
import type { AlertLevel, AlertType, User } from "@/types";

const LEVEL_FILTERS: { key: AlertLevel | "all"; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "critical", label: "Critique" },
  { key: "danger", label: "Danger" },
  { key: "warning", label: "Avertissement" },
  { key: "info", label: "Info" },
];

const TYPE_FILTERS: { key: AlertType | "all"; label: string }[] = [
  { key: "all", label: "Tous types" },
  { key: "vidange", label: "Vidange" },
  { key: "revision", label: "Révision" },
  { key: "assurance", label: "Assurance" },
  { key: "visite_technique", label: "Visite technique" },
  { key: "compteur", label: "Compteur" },
];

const LEVEL_ORDER: AlertLevel[] = ["critical", "danger", "warning", "info"];

const FALLBACK_USER: User = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "administrateur",
  active: true,
  createdAt: "",
};

export default function AlertesPage() {
  const currentUser = useAuthStore((s) => s.currentUser) ?? FALLBACK_USER;
  const { alerts, vehicles, markAlertTreated } = useDataStore();
  const showToast = useToastStore((s) => s.show);
  const allowTreat = canTreatAlert(currentUser.role);

  const [levelFilter, setLevelFilter] = useState<AlertLevel | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");
  const [showTreated, setShowTreated] = useState(false);

  const stats = useMemo(() => {
    const active = alerts.filter((a) => !a.treated);
    return {
      total: active.length,
      critical: active.filter((a) => a.level === "critical").length,
      danger: active.filter((a) => a.level === "danger").length,
      warning: active.filter((a) => a.level === "warning").length,
      info: active.filter((a) => a.level === "info").length,
      treated: alerts.filter((a) => a.treated).length,
    };
  }, [alerts]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (!showTreated && a.treated) return false;
      if (showTreated && !a.treated) return false;
      if (levelFilter !== "all" && a.level !== levelFilter) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      return true;
    });
  }, [alerts, levelFilter, typeFilter, showTreated]);

  const grouped = useMemo(() => {
    const map = new Map<AlertLevel, typeof filtered>();
    for (const level of LEVEL_ORDER) {
      map.set(level, filtered.filter((a) => a.level === level));
    }
    return map;
  }, [filtered]);

  function handleTreat(id: string) {
    markAlertTreated(id);
    showToast("Alerte marquée comme traitée.", "success");
  }

  return (
    <AppShell title="Alertes">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alertes</h1>
          <p className="page-sub">Suivi des échéances et anomalies du parc.</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <StatCard title="Actives" value={stats.total} icon={<Bell size={18} />} color="navy" />
        <StatCard title="Critiques" value={stats.critical} icon={<AlertOctagon size={18} />} color="red" />
        <StatCard title="Danger" value={stats.danger} icon={<AlertTriangle size={18} />} color="orange" />
        <StatCard title="Avertissement" value={stats.warning} icon={<AlertTriangle size={18} />} color="amber" />
        <StatCard title="Info" value={stats.info} icon={<Info size={18} />} color="blue" />
        <StatCard title="Traitées" value={stats.treated} icon={<CheckCircle2 size={18} />} color="green" />
      </div>

      <div className={styles.filterRow}>
        <div className="flex flex-wrap gap-2">
          {LEVEL_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setLevelFilter(f.key)}
              className="btn"
              style={{
                background: levelFilter === f.key ? "var(--navy)" : "var(--surface)",
                color: levelFilter === f.key ? "white" : "var(--foreground)",
                border: `1px solid ${levelFilter === f.key ? "var(--navy)" : "var(--border)"}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button
          variant={showTreated ? "primary" : "outline"}
          onClick={() => setShowTreated((v) => !v)}
        >
          <CheckCircle2 size={15} />
          {showTreated ? "Voir les alertes actives" : "Voir les alertes traitées"}
        </Button>
      </div>

      <div className={styles.typeRow}>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setTypeFilter(f.key)}
            className="btn btn-outline"
            style={{
              borderColor: typeFilter === f.key ? "var(--accent)" : "var(--border)",
              color: typeFilter === f.key ? "var(--accent)" : "var(--foreground)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <Empty
            icon={<Bell size={24} />}
            title={showTreated ? "Aucune alerte traitée" : "Aucune alerte active"}
            description="Aucune alerte ne correspond aux filtres sélectionnés."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {LEVEL_ORDER.map((level) => {
            const items = grouped.get(level) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={level}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge color={ALERT_LEVEL_BADGE[level].replace("badge-", "") as "green" | "blue" | "amber" | "red" | "orange" | "slate" | "purple"}>
                    {ALERT_LEVEL_LABELS[level]}
                  </Badge>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {items.length} alerte{items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className={styles.alertsGrid}>
                  {items.map((a) => {
                    const v = vehicles.find((veh) => veh.id === a.vehicleId);
                    const days = daysUntil(a.dueDate);
                    return (
                      <div
                        key={a.id}
                        className="card card-p border-l-4"
                        style={{ borderLeftWidth: 4 }}
                      >
                        <div className={`flex items-start justify-between gap-2 ${ALERT_LEVEL_BORDER[level]}`}>
                          <div className="flex items-center gap-2">
                            <Truck size={15} style={{ color: "var(--muted)" }} />
                            <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                              {v?.plate ?? "—"}
                            </span>
                          </div>
                          <Badge color="slate">{ALERT_TYPE_LABELS[a.type]}</Badge>
                        </div>
                        <p className="text-sm mt-2" style={{ color: "var(--foreground)" }}>
                          {a.message}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: "var(--muted)" }}>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(a.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gauge size={12} />
                            {a.treated
                              ? "Traitée"
                              : days >= 0
                              ? `Échéance dans ${days} j`
                              : `En retard de ${Math.abs(days)} j`}
                          </span>
                        </div>
                        {allowTreat && !a.treated && (
                          <div className="mt-3">
                            <Button variant="outline" className="w-full" onClick={() => handleTreat(a.id)}>
                              <CheckCircle2 size={14} />
                              Marquer comme traitée
                            </Button>
                          </div>
                        )}
                        {a.treated && a.treatedAt && (
                          <p className="text-xs mt-3" style={{ color: "var(--success)" }}>
                            Traitée le {formatDate(a.treatedAt)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
