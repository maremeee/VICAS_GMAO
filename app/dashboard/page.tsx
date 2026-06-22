"use client";

import styles from "./page.module.css";

import { useMemo } from "react";
import {
  Truck,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  ClipboardList,
  Fuel,
  MapPin,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { ChartCard, CHART_TOOLTIP_STYLE, CHART_COLORS } from "@/components/charts/ChartCard";
import { Badge, TableWrap, Empty } from "@/components/ui/Shared";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import {
  MONTHLY_LABELS,
  MONTHLY_AVAILABILITY,
  MONTHLY_MAINTENANCE_COST,
  MONTHLY_FUEL_CONSUMPTION,
} from "@/lib/mock-data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import {
  VEHICLE_STATUS_BADGE,
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
  BT_STATUS_BADGE,
  BT_STATUS_LABELS,
  ASSIGNMENT_STATUS_BADGE,
  ASSIGNMENT_STATUS_LABELS,
} from "@/lib/labels";

const availabilityData = MONTHLY_LABELS.map((m, i) => ({
  month: m,
  taux: MONTHLY_AVAILABILITY[i],
}));

export default function DashboardPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { vehicles, workOrders, fuelRecords, mechanics, drivers, assignments, alerts } =
    useDataStore();

  const role = currentUser?.role;

  const kpis = useMemo(() => {
    const total = vehicles.length;
    const disponibles = vehicles.filter((v) => v.status === "disponible").length;
    const enMaintenance = vehicles.filter((v) => v.status === "en_maintenance").length;
    const enPanne = vehicles.filter((v) => v.status === "en_panne").length;
    const btOuverts = workOrders.filter((w) => w.status !== "cloture" && w.status !== "termine").length;
    const thisMonthLiters = fuelRecords.reduce((sum, f) => sum + f.liters, 0);
    return { total, disponibles, enMaintenance, enPanne, btOuverts, thisMonthLiters };
  }, [vehicles, workOrders, fuelRecords]);

  const statusBreakdown = useMemo(() => {
    const total = vehicles.length || 1;
    const statuses = ["disponible", "en_mission", "en_maintenance", "en_panne", "hors_service"] as const;
    return statuses.map((s) => ({
      status: s,
      count: vehicles.filter((v) => v.status === s).length,
      pct: Math.round((vehicles.filter((v) => v.status === s).length / total) * 100),
    }));
  }, [vehicles]);

  const recentVehicles = vehicles.slice(0, 5);
  const recentWorkOrders = workOrders.slice(0, 5);
  const activeAlerts = alerts.filter((a) => !a.treated).slice(0, 4);

  // ---- Simplified view: mécanicien ----
  if (role === "mecanicien") {
    const myMechanic = mechanics.find((m) => m.userId === currentUser?.id);
    const myBTs = workOrders.filter((w) => w.mechanicId === myMechanic?.id);
    const openBTs = myBTs.filter((w) => w.status === "ouvert" || w.status === "en_cours");
    const waitingParts = myBTs.filter((w) => w.status === "attente_pieces");
    const done = myBTs.filter((w) => w.status === "termine" || w.status === "cloture");

    return (
      <AppShell title="Tableau de bord">
        <div className="page-header">
          <div>
            <h1 className="page-title">Bonjour, {currentUser?.firstName}</h1>
            <p className="page-sub">Voici un aperçu de vos bons de travail.</p>
          </div>
        </div>

        <div className={styles.kpiGridSmall}>
          <StatCard title="Mes BT en cours" value={openBTs.length} icon={<ClipboardList size={18} />} color="blue" />
          <StatCard title="Attente pièces" value={waitingParts.length} icon={<AlertTriangle size={18} />} color="amber" />
          <StatCard title="Terminés" value={done.length} icon={<CheckCircle2 size={18} />} color="green" />
        </div>

        <div className="card card-p">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
            Mes bons de travail
          </h3>
          {myBTs.length === 0 ? (
            <Empty title="Aucun bon de travail" description="Aucun BT ne vous est actuellement assigné." />
          ) : (
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th className="table-header">N° BT</th>
                    <th className="table-header">Véhicule</th>
                    <th className="table-header">Description</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {myBTs.map((w) => {
                    const v = vehicles.find((veh) => veh.id === w.vehicleId);
                    return (
                      <tr key={w.id} className="table-row">
                        <td className="table-cell font-semibold">{w.number}</td>
                        <td className="table-cell">{v?.plate ?? "—"}</td>
                        <td className="table-cell max-w-xs truncate">{w.description}</td>
                        <td className="table-cell">{formatDate(w.date)}</td>
                        <td className="table-cell">
                          <Badge color={BT_STATUS_BADGE[w.status].replace("badge-", "") as any}>
                            {BT_STATUS_LABELS[w.status]}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          )}
        </div>
      </AppShell>
    );
  }

  // ---- Simplified view: chauffeur ----
  if (role === "chauffeur") {
    const myDriver = drivers.find((d) => d.userId === currentUser?.id);
    const myMissions = assignments.filter((a) => a.driverId === myDriver?.id);
    const active = myMissions.filter((a) => a.status === "active");
    const finished = myMissions.filter((a) => a.status === "terminee");

    return (
      <AppShell title="Tableau de bord">
        <div className="page-header">
          <div>
            <h1 className="page-title">Bonjour, {currentUser?.firstName}</h1>
            <p className="page-sub">Voici un aperçu de vos missions.</p>
          </div>
        </div>

        <div className={styles.kpiGridSmall}>
          <StatCard title="Missions actives" value={active.length} icon={<MapPin size={18} />} color="blue" />
          <StatCard title="Missions terminées" value={finished.length} icon={<CheckCircle2 size={18} />} color="green" />
          <StatCard title="Total missions" value={myMissions.length} icon={<Truck size={18} />} color="navy" />
        </div>

        <div className="card card-p">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
            Mes missions
          </h3>
          {myMissions.length === 0 ? (
            <Empty title="Aucune mission" description="Aucune mission ne vous est actuellement assignée." />
          ) : (
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th className="table-header">Véhicule</th>
                    <th className="table-header">Début</th>
                    <th className="table-header">Fin</th>
                    <th className="table-header">Km départ</th>
                    <th className="table-header">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {myMissions.map((a) => {
                    const v = vehicles.find((veh) => veh.id === a.vehicleId);
                    return (
                      <tr key={a.id} className="table-row">
                        <td className="table-cell font-semibold">{v?.plate ?? "—"}</td>
                        <td className="table-cell">{formatDate(a.startDate)}</td>
                        <td className="table-cell">{a.endDate ? formatDate(a.endDate) : "—"}</td>
                        <td className="table-cell">{formatNumber(a.departureKm)} km</td>
                        <td className="table-cell">
                          <Badge color={ASSIGNMENT_STATUS_BADGE[a.status].replace("badge-", "") as any}>
                            {ASSIGNMENT_STATUS_LABELS[a.status]}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          )}
        </div>
      </AppShell>
    );
  }

  // ---- Full dashboard ----
  return (
    <AppShell title="Tableau de bord">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-sub">Vue d&apos;ensemble du parc et des opérations.</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <StatCard title="Total engins" value={kpis.total} icon={<Truck size={18} />} color="navy" />
        <StatCard title="Disponibles" value={kpis.disponibles} icon={<CheckCircle2 size={18} />} color="green" />
        <StatCard title="En maintenance" value={kpis.enMaintenance} icon={<Wrench size={18} />} color="amber" />
        <StatCard title="En panne" value={kpis.enPanne} icon={<AlertTriangle size={18} />} color="red" />
        <StatCard title="BT ouverts" value={kpis.btOuverts} icon={<ClipboardList size={18} />} color="blue" />
        <StatCard title="Carburant (mois)" value={`${formatNumber(kpis.thisMonthLiters)} L`} icon={<Fuel size={18} />} color="orange" />
      </div>

      <div className={styles.mainRow}>
        <div className="lg:col-span-2">
          <ChartCard title="Taux de disponibilité de la flotte" subtitle="Évolution sur 12 mois" height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={availabilityData}>
                <defs>
                  <linearGradient id="availGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.brand} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, "Disponibilité"]} />
                <Area type="monotone" dataKey="taux" stroke={CHART_COLORS.brand} strokeWidth={2} fill="url(#availGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="card card-p">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
            Répartition du parc
          </h3>
          <div className="flex flex-col gap-3.5">
            {statusBreakdown.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                    {VEHICLE_STATUS_LABELS[s.status]}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {s.count} ({s.pct}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${s.pct}%`,
                      background:
                        s.status === "disponible"
                          ? CHART_COLORS.success
                          : s.status === "en_mission"
                          ? CHART_COLORS.brand
                          : s.status === "en_maintenance"
                          ? CHART_COLORS.warning
                          : s.status === "en_panne"
                          ? CHART_COLORS.accent
                          : CHART_COLORS.critical,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <ChartCard title="Coûts de maintenance" subtitle="Préventive vs corrective (FCFA)" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_MAINTENANCE_COST}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: any) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="preventive" name="Préventive" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="corrective" name="Corrective" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Consommation carburant" subtitle="Volume mensuel (litres)" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_FUEL_CONSUMPTION}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: any) => [`${formatNumber(v)} L`, "Volume"]} />
              <Bar dataKey="liters" name="Litres" fill={CHART_COLORS.brand} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className={styles.chartsRow}>
        <div className="card card-p">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
            Véhicules récents
          </h3>
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th className="table-header">Plaque</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentVehicles.map((v) => (
                  <tr key={v.id} className="table-row">
                    <td className="table-cell font-semibold">{v.plate}</td>
                    <td className="table-cell">{VEHICLE_TYPE_LABELS[v.type]}</td>
                    <td className="table-cell">
                      <Badge color={VEHICLE_STATUS_BADGE[v.status].replace("badge-", "") as any}>
                        {VEHICLE_STATUS_LABELS[v.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </div>

        <div className="card card-p">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
            Bons de travail récents
          </h3>
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th className="table-header">N° BT</th>
                  <th className="table-header">Véhicule</th>
                  <th className="table-header">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkOrders.map((w) => {
                  const v = vehicles.find((veh) => veh.id === w.vehicleId);
                  return (
                    <tr key={w.id} className="table-row">
                      <td className="table-cell font-semibold">{w.number}</td>
                      <td className="table-cell">{v?.plate ?? "—"}</td>
                      <td className="table-cell">
                        <Badge color={BT_STATUS_BADGE[w.status].replace("badge-", "") as any}>
                          {BT_STATUS_LABELS[w.status]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        </div>
      </div>

      <div className="card card-p">
        <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
          Alertes actives
        </h3>
        {activeAlerts.length === 0 ? (
          <Empty title="Aucune alerte active" description="Toutes les alertes ont été traitées." />
        ) : (
          <div className={styles.alertsGrid}>
            {activeAlerts.map((a) => {
              const v = vehicles.find((veh) => veh.id === a.vehicleId);
              return (
                <div
                  key={a.id}
                  className={styles.alertItem}
                >
                  <AlertTriangle
                    size={16}
                    className="shrink-0 mt-0.5"
                    style={{
                      color:
                        a.level === "critical"
                          ? "var(--critical)"
                          : a.level === "danger"
                          ? "var(--accent)"
                          : a.level === "warning"
                          ? "var(--warning)"
                          : "var(--brand)",
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {v?.plate ?? "—"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {a.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
