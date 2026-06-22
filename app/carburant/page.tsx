"use client";

import styles from "./page.module.css";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, Fuel, Wallet, Gauge } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { TableWrap, Empty } from "@/components/ui/Shared";
import { StatCard } from "@/components/ui/StatCard";
import { ChartCard, CHART_TOOLTIP_STYLE, CHART_COLORS } from "@/components/charts/ChartCard";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { useToastStore } from "@/lib/toast-store";
import { fuelRecordSchema, type FuelRecordInput } from "@/lib/validations";
import { MONTHLY_FUEL_CONSUMPTION } from "@/lib/mock-data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { User } from "@/types";

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

export default function CarburantPage() {
  const currentUser = useAuthStore((s) => s.currentUser) ?? FALLBACK_USER;
  const { vehicles, drivers, fuelRecords, addFuelRecord } = useDataStore();
  const showToast = useToastStore((s) => s.show);

  const isChauffeur = currentUser.role === "chauffeur";
  const myDriver = drivers.find((d) => d.userId === currentUser.id);

  const records = isChauffeur
    ? fuelRecords.filter((f) => f.driverId === myDriver?.id)
    : fuelRecords;

  const [formOpen, setFormOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FuelRecordInput>({
    resolver: zodResolver(fuelRecordSchema) as any,
    defaultValues: {
      vehicleId: "",
      date: new Date().toISOString().slice(0, 10),
      fuelType: "diesel",
      liters: 0,
      cost: 0,
      odometer: 0,
      supplier: "",
    },
  });

  const kpis = useMemo(() => {
    const totalLiters = records.reduce((s, f) => s + f.liters, 0);
    const totalCost = records.reduce((s, f) => s + f.cost, 0);
    const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0;
    return { totalLiters, totalCost, avgPrice };
  }, [records]);

  const perVehicleData = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((f) => {
      map.set(f.vehicleId, (map.get(f.vehicleId) ?? 0) + f.liters);
    });
    return Array.from(map.entries())
      .map(([vehicleId, liters]) => ({
        plate: vehicles.find((v) => v.id === vehicleId)?.plate ?? "—",
        liters,
      }))
      .sort((a, b) => b.liters - a.liters);
  }, [records, vehicles]);

  function onSubmit(data: FuelRecordInput) {
    addFuelRecord({
      ...data,
      driverId: isChauffeur ? myDriver?.id : undefined,
    });
    showToast("Plein de carburant enregistré.", "success");
    setFormOpen(false);
    reset();
  }

  return (
    <AppShell title="Carburant">
      <div className="page-header">
        <div>
          <h1 className="page-title">Carburant</h1>
          <p className="page-sub">
            {isChauffeur ? "Historique de consommation de votre véhicule." : "Suivi de la consommation de carburant de la flotte."}
          </p>
        </div>
        <Button variant="orange" onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Ajouter un plein
        </Button>
      </div>

      <div className={styles.kpiGrid}>
        <StatCard title="Total litres" value={`${formatNumber(kpis.totalLiters)} L`} icon={<Fuel size={18} />} color="blue" />
        <StatCard title="Coût total" value={formatCurrency(kpis.totalCost)} icon={<Wallet size={18} />} color="orange" />
        <StatCard title="Prix moyen / litre" value={formatCurrency(kpis.avgPrice)} icon={<Gauge size={18} />} color="navy" />
      </div>

      {!isChauffeur && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard title="Évolution mensuelle" subtitle="Volume de carburant (litres)" height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_FUEL_CONSUMPTION}>
                <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: any) => [`${formatNumber(v)} L`, "Volume"]} />
                <Bar dataKey="liters" fill={CHART_COLORS.brand} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Volume par véhicule" subtitle="Total consommé" height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perVehicleData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="plate" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: any) => [`${formatNumber(v)} L`, "Volume"]} />
                <Bar dataKey="liters" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      <div className="card card-p">
        <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
          Historique des pleins
        </h3>
        {records.length === 0 ? (
          <Empty icon={<Fuel size={24} />} title="Aucun enregistrement" description="Aucun plein de carburant n'a encore été enregistré." />
        ) : (
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Véhicule</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Litres</th>
                  <th className="table-header">Coût</th>
                  <th className="table-header">Km</th>
                  <th className="table-header">Fournisseur</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((f) => {
                    const v = vehicles.find((veh) => veh.id === f.vehicleId);
                    return (
                      <tr key={f.id} className="table-row">
                        <td className="table-cell">{formatDate(f.date)}</td>
                        <td className="table-cell font-semibold">{v?.plate ?? "—"}</td>
                        <td className="table-cell">{f.fuelType === "diesel" ? "Diesel" : "Essence"}</td>
                        <td className="table-cell">{formatNumber(f.liters)} L</td>
                        <td className="table-cell">{formatCurrency(f.cost)}</td>
                        <td className="table-cell">{f.odometer > 0 ? `${formatNumber(f.odometer)} km` : "—"}</td>
                        <td className="table-cell">{f.supplier}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Ajouter un plein de carburant"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Annuler</Button>
            <Button variant="orange" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Enregistrer</Button>
          </>
        }
      >
        <form>
          <Field label="Véhicule" error={errors.vehicleId?.message} required>
            <Select error={!!errors.vehicleId} {...register("vehicleId")}>
              <option value="">Sélectionnez un véhicule</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Date" error={errors.date?.message} required>
              <Input type="date" error={!!errors.date} {...register("date")} />
            </Field>
            <Field label="Type de carburant" error={errors.fuelType?.message} required>
              <Select error={!!errors.fuelType} {...register("fuelType")}>
                <option value="diesel">Diesel</option>
                <option value="essence">Essence</option>
              </Select>
            </Field>
            <Field label="Quantité (litres)" error={errors.liters?.message} required>
              <Input type="number" min={0} step="0.1" error={!!errors.liters} {...register("liters")} />
            </Field>
            <Field label="Coût (FCFA)" error={errors.cost?.message} required>
              <Input type="number" min={0} error={!!errors.cost} {...register("cost")} />
            </Field>
            <Field label="Kilométrage" error={errors.odometer?.message}>
              <Input type="number" min={0} error={!!errors.odometer} {...register("odometer")} />
            </Field>
            <Field label="Fournisseur" error={errors.supplier?.message} required>
              <Input placeholder="Total Energies..." error={!!errors.supplier} {...register("supplier")} />
            </Field>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
