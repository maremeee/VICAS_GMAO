"use client";

import styles from "./page.module.css";

import { useMemo, useState } from "react";
import {
  Wrench,
  Fuel,
  Gauge,
  Wallet,
  FileDown,
  FileSpreadsheet,
  ClipboardList,
  Truck,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { ChartCard, CHART_TOOLTIP_STYLE, CHART_COLORS } from "@/components/charts/ChartCard";
import { TableWrap, Badge } from "@/components/ui/Shared";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { useToastStore } from "@/lib/toast-store";
import { canExportReports } from "@/lib/permissions";
import {
  MONTHLY_LABELS,
  MONTHLY_AVAILABILITY,
  MONTHLY_MAINTENANCE_COST,
  MONTHLY_FUEL_CONSUMPTION,
} from "@/lib/mock-data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { VEHICLE_TYPE_LABELS, BT_TYPE_LABELS } from "@/lib/labels";
import type { User } from "@/types";

type Tab = "maintenance" | "carburant" | "disponibilite" | "couts";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "maintenance", label: "Maintenance", icon: <Wrench size={15} /> },
  { key: "carburant", label: "Carburant", icon: <Fuel size={15} /> },
  { key: "disponibilite", label: "Disponibilité", icon: <Gauge size={15} /> },
  { key: "couts", label: "Coûts d'exploitation", icon: <Wallet size={15} /> },
];

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

export default function RapportsPage() {
  const currentUser = useAuthStore((s) => s.currentUser) ?? FALLBACK_USER;
  const { vehicles, workOrders, fuelRecords } = useDataStore();
  const showToast = useToastStore((s) => s.show);
  const canExport = canExportReports(currentUser.role);

  const [tab, setTab] = useState<Tab>("maintenance");

  function handleExport(format: "pdf" | "excel") {
    showToast(
      `Export ${format === "pdf" ? "PDF" : "Excel"} disponible avec backend.`,
      "info"
    );
  }

  function totalCost(w: (typeof workOrders)[number]) {
    const partsTotal = w.parts.reduce((s, p) => s + p.qty * p.unitPrice, 0);
    return partsTotal + w.hoursWorked * w.laborCostPerHour;
  }

  // ---- Maintenance data ----
  const maintenance = useMemo(() => {
    const total = workOrders.length;
    const preventive = workOrders.filter((w) => w.type === "preventive").length;
    const corrective = workOrders.filter((w) => w.type === "corrective").length;
    const totalCostAll = workOrders.reduce((s, w) => s + totalCost(w), 0);
    const byType = [
      { name: "Préventive", value: preventive },
      { name: "Corrective", value: corrective },
    ];
    return { total, preventive, corrective, totalCostAll, byType };
  }, [workOrders]);

  // ---- Carburant data ----
  const carburant = useMemo(() => {
    const totalLiters = fuelRecords.reduce((s, f) => s + f.liters, 0);
    const totalCostAll = fuelRecords.reduce((s, f) => s + f.cost, 0);
    const avgPrice = totalLiters > 0 ? totalCostAll / totalLiters : 0;
    const perVehicle = vehicles
      .map((v) => ({
        plate: v.plate,
        liters: fuelRecords.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.liters, 0),
      }))
      .filter((v) => v.liters > 0)
      .sort((a, b) => b.liters - a.liters);
    return { totalLiters, totalCostAll, avgPrice, perVehicle };
  }, [fuelRecords, vehicles]);

  // ---- Disponibilité data ----
  const disponibilite = useMemo(() => {
    const avgAvailability =
      MONTHLY_AVAILABILITY.reduce((s, v) => s + v, 0) / MONTHLY_AVAILABILITY.length;
    const disponibles = vehicles.filter((v) => v.status === "disponible").length;
    const indisponibles = vehicles.length - disponibles;
    const byType = Array.from(
      vehicles.reduce((map, v) => {
        const entry = map.get(v.type) ?? { type: v.type, total: 0, disponible: 0 };
        entry.total += 1;
        if (v.status === "disponible") entry.disponible += 1;
        map.set(v.type, entry);
        return map;
      }, new Map<string, { type: string; total: number; disponible: number }>())
    ).map(([, v]) => v);
    return { avgAvailability, disponibles, indisponibles, byType };
  }, [vehicles]);

  // ---- Coûts data ----
  const couts = useMemo(() => {
    const maintenanceCost = workOrders.reduce((s, w) => s + totalCost(w), 0);
    const fuelCost = fuelRecords.reduce((s, f) => s + f.cost, 0);
    const totalCostAll = maintenanceCost + fuelCost;
    const combined = MONTHLY_LABELS.map((m, i) => ({
      month: m,
      maintenance: MONTHLY_MAINTENANCE_COST[i]?.preventive + MONTHLY_MAINTENANCE_COST[i]?.corrective || 0,
      carburant: MONTHLY_FUEL_CONSUMPTION[i]?.liters
        ? MONTHLY_FUEL_CONSUMPTION[i].liters * carburant.avgPrice
        : 0,
    }));
    return { maintenanceCost, fuelCost, totalCostAll, combined };
  }, [workOrders, fuelRecords, carburant.avgPrice]);

  const PIE_COLORS = [CHART_COLORS.success, CHART_COLORS.accent];

  return (
    <AppShell title="Rapports">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rapports</h1>
          <p className="page-sub">Analyses et indicateurs de performance du parc.</p>
        </div>
        {canExport && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <FileSpreadsheet size={15} />
              Export Excel
            </Button>
            <Button variant="orange" onClick={() => handleExport("pdf")}>
              <FileDown size={15} />
              Export PDF
            </Button>
          </div>
        )}
      </div>

      <div className={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="btn"
            style={{
              background: tab === t.key ? "var(--navy)" : "var(--surface)",
              color: tab === t.key ? "white" : "var(--foreground)",
              border: `1px solid ${tab === t.key ? "var(--navy)" : "var(--border)"}`,
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "maintenance" && (
        <div>
          <div className={styles.kpiGrid}>
            <StatCard title="Total BT" value={maintenance.total} icon={<ClipboardList size={18} />} color="navy" />
            <StatCard title="Préventive" value={maintenance.preventive} icon={<Wrench size={18} />} color="green" />
            <StatCard title="Corrective" value={maintenance.corrective} icon={<Wrench size={18} />} color="orange" />
            <StatCard title="Coût total" value={formatCurrency(maintenance.totalCostAll)} icon={<Wallet size={18} />} color="blue" />
          </div>
          <div className={styles.chartsGrid}>
            <ChartCard title="Coûts de maintenance" subtitle="Préventive vs corrective (FCFA)">
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
            <ChartCard title="Répartition par type" subtitle="Préventive vs corrective">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={maintenance.byType} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {maintenance.byType.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="card card-p">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
              Détail des bons de travail
            </h3>
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th className="table-header">N° BT</th>
                    <th className="table-header">Véhicule</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Coût</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((w) => {
                    const v = vehicles.find((veh) => veh.id === w.vehicleId);
                    return (
                      <tr key={w.id} className="table-row">
                        <td className="table-cell font-semibold">{w.number}</td>
                        <td className="table-cell">{v?.plate ?? "—"}</td>
                        <td className="table-cell">{BT_TYPE_LABELS[w.type]}</td>
                        <td className="table-cell">{formatDate(w.date)}</td>
                        <td className="table-cell">{formatCurrency(totalCost(w))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          </div>
        </div>
      )}

      {tab === "carburant" && (
        <div>
          <div className={styles.kpiGridThree}>
            <StatCard title="Volume total" value={`${formatNumber(carburant.totalLiters)} L`} icon={<Fuel size={18} />} color="orange" />
            <StatCard title="Coût total" value={formatCurrency(carburant.totalCostAll)} icon={<Wallet size={18} />} color="blue" />
            <StatCard title="Prix moyen / L" value={formatCurrency(carburant.avgPrice)} icon={<TrendingUp size={18} />} color="navy" />
          </div>
          <div className={styles.chartsGrid}>
            <ChartCard title="Évolution mensuelle" subtitle="Volume (litres)">
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
            <ChartCard title="Volume par véhicule" subtitle="Consommation cumulée (litres)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carburant.perVehicle} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="plate" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: any) => [`${formatNumber(v)} L`, "Volume"]} />
                  <Bar dataKey="liters" name="Litres" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="card card-p">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
              Historique des pleins
            </h3>
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th className="table-header">Date</th>
                    <th className="table-header">Véhicule</th>
                    <th className="table-header">Litres</th>
                    <th className="table-header">Coût</th>
                    <th className="table-header">Fournisseur</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelRecords.map((f) => {
                    const v = vehicles.find((veh) => veh.id === f.vehicleId);
                    return (
                      <tr key={f.id} className="table-row">
                        <td className="table-cell">{formatDate(f.date)}</td>
                        <td className="table-cell font-semibold">{v?.plate ?? "—"}</td>
                        <td className="table-cell">{formatNumber(f.liters)} L</td>
                        <td className="table-cell">{formatCurrency(f.cost)}</td>
                        <td className="table-cell">{f.supplier}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          </div>
        </div>
      )}

      {tab === "disponibilite" && (
        <div>
          <div className={styles.kpiGridThree}>
            <StatCard title="Taux moyen" value={`${disponibilite.avgAvailability.toFixed(0)}%`} icon={<Gauge size={18} />} color="green" />
            <StatCard title="Disponibles" value={disponibilite.disponibles} icon={<Truck size={18} />} color="blue" />
            <StatCard title="Indisponibles" value={disponibilite.indisponibles} icon={<Wrench size={18} />} color="amber" />
          </div>
          <div className={styles.chartsGrid}>
            <ChartCard title="Taux de disponibilité" subtitle="Évolution sur 12 mois">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_LABELS.map((m, i) => ({ month: m, taux: MONTHLY_AVAILABILITY[i] }))}>
                  <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, "Disponibilité"]} />
                  <Line type="monotone" dataKey="taux" stroke={CHART_COLORS.brand} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Disponibilité par type d'engin" subtitle="Nombre disponible / total">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disponibilite.byType.map((d) => ({ ...d, type: VEHICLE_TYPE_LABELS[d.type as keyof typeof VEHICLE_TYPE_LABELS] }))}>
                  <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" name="Total" fill={CHART_COLORS.navy} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disponible" name="Disponible" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="card card-p">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
              État du parc
            </h3>
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th className="table-header">Plaque</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Km</th>
                    <th className="table-header">Heures</th>
                    <th className="table-header">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="table-row">
                      <td className="table-cell font-semibold">{v.plate}</td>
                      <td className="table-cell">{VEHICLE_TYPE_LABELS[v.type]}</td>
                      <td className="table-cell">{formatNumber(v.km)} km</td>
                      <td className="table-cell">{formatNumber(v.hours)} h</td>
                      <td className="table-cell">
                        <Badge color={v.status === "disponible" ? "green" : "slate"}>
                          {v.status === "disponible" ? "Disponible" : "Indisponible"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </div>
        </div>
      )}

      {tab === "couts" && (
        <div>
          <div className={styles.kpiGridThree}>
            <StatCard title="Coût maintenance" value={formatCurrency(couts.maintenanceCost)} icon={<Wrench size={18} />} color="amber" />
            <StatCard title="Coût carburant" value={formatCurrency(couts.fuelCost)} icon={<Fuel size={18} />} color="orange" />
            <StatCard title="Coût total" value={formatCurrency(couts.totalCostAll)} icon={<Wallet size={18} />} color="navy" />
          </div>
          <div className="mb-6">
            <ChartCard title="Coûts d'exploitation mensuels" subtitle="Maintenance + carburant (FCFA)" height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={couts.combined}>
                  <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: any) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="maintenance" name="Maintenance" stackId="a" fill={CHART_COLORS.warning} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="carburant" name="Carburant" stackId="a" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="card card-p">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
              Synthèse des coûts
            </h3>
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th className="table-header">Catégorie</th>
                    <th className="table-header">Montant</th>
                    <th className="table-header">Part du total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-row">
                    <td className="table-cell font-semibold">Maintenance</td>
                    <td className="table-cell">{formatCurrency(couts.maintenanceCost)}</td>
                    <td className="table-cell">
                      {couts.totalCostAll > 0 ? Math.round((couts.maintenanceCost / couts.totalCostAll) * 100) : 0}%
                    </td>
                  </tr>
                  <tr className="table-row">
                    <td className="table-cell font-semibold">Carburant</td>
                    <td className="table-cell">{formatCurrency(couts.fuelCost)}</td>
                    <td className="table-cell">
                      {couts.totalCostAll > 0 ? Math.round((couts.fuelCost / couts.totalCostAll) * 100) : 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </TableWrap>
          </div>
        </div>
      )}
    </AppShell>
  );
}
