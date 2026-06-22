"use client";

import styles from "./page.module.css";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Eye,
  CheckCircle2,
  Wrench,
  ClipboardList,
  Clock,
  PackageX,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Confirm } from "@/components/ui/Confirm";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { TableWrap, Empty, Badge } from "@/components/ui/Shared";
import { StatCard } from "@/components/ui/StatCard";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { useToastStore } from "@/lib/toast-store";
import { canCreate } from "@/lib/permissions";
import {
  BT_STATUS_BADGE,
  BT_STATUS_LABELS,
  BT_TYPE_LABELS,
} from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BTStatus, BTType, WorkOrder, User } from "@/types";

interface DeclareForm {
  vehicleId: string;
  mechanicId: string;
  type: BTType;
  description: string;
  date: string;
}

const STATUS_TABS: { key: BTStatus | "all"; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "ouvert", label: "Ouvert" },
  { key: "en_cours", label: "En cours" },
  { key: "attente_pieces", label: "Attente pièces" },
  { key: "termine", label: "Terminé" },
  { key: "cloture", label: "Clôturé" },
];

const TYPE_TABS: { key: BTType | "all"; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "preventive", label: "Préventive" },
  { key: "corrective", label: "Corrective" },
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

export default function MaintenancePage() {
  const currentUser = useAuthStore((s) => s.currentUser) ?? FALLBACK_USER;
  const { vehicles, mechanics, workOrders, addWorkOrder, closeWorkOrder } = useDataStore();
  const showToast = useToastStore((s) => s.show);

  const myMechanic = mechanics.find((m) => m.userId === currentUser.id);
  const isMecanicien = currentUser.role === "mecanicien";
  const allowCreate = canCreate(currentUser.role, "maintenance");

  const baseOrders = isMecanicien
    ? workOrders.filter((w) => w.mechanicId === myMechanic?.id)
    : workOrders;

  const [statusTab, setStatusTab] = useState<BTStatus | "all">("all");
  const [typeTab, setTypeTab] = useState<BTType | "all">("all");
  const [declareOpen, setDeclareOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<WorkOrder | null>(null);
  const [closeTarget, setCloseTarget] = useState<WorkOrder | null>(null);

  const stats = useMemo(() => {
    return {
      total: baseOrders.length,
      open: baseOrders.filter((w) => w.status === "ouvert").length,
      inProgress: baseOrders.filter((w) => w.status === "en_cours").length,
      waitingParts: baseOrders.filter((w) => w.status === "attente_pieces").length,
      completed: baseOrders.filter((w) => w.status === "termine" || w.status === "cloture").length,
    };
  }, [baseOrders]);

  const filtered = useMemo(() => {
    return baseOrders.filter((w) => {
      if (statusTab !== "all" && w.status !== statusTab) return false;
      if (typeTab !== "all" && w.type !== typeTab) return false;
      return true;
    });
  }, [baseOrders, statusTab, typeTab]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeclareForm>({
    defaultValues: {
      vehicleId: "",
      mechanicId: myMechanic?.id ?? "",
      type: "corrective",
      description: "",
      date: new Date().toISOString().slice(0, 10),
    },
  });

  function onSubmit(data: DeclareForm) {
    if (!data.vehicleId || !data.mechanicId || data.description.length < 5) {
      showToast("Veuillez compléter tous les champs requis.", "error");
      return;
    }
    addWorkOrder({
      vehicleId: data.vehicleId,
      mechanicId: data.mechanicId,
      type: data.type,
      description: data.description,
      date: data.date,
      status: "ouvert",
      parts: [],
      hoursWorked: 0,
      laborCostPerHour: 8000,
    });
    showToast("Incident déclaré, un nouveau BT a été créé.", "success");
    setDeclareOpen(false);
    reset();
  }

  function totalCost(w: WorkOrder) {
    const partsTotal = w.parts.reduce((s, p) => s + p.qty * p.unitPrice, 0);
    const laborTotal = w.hoursWorked * w.laborCostPerHour;
    return partsTotal + laborTotal;
  }

  return (
    <AppShell title="Maintenance">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-sub">
            {isMecanicien ? "Vos bons de travail assignés." : "Suivi des opérations de maintenance du parc."}
          </p>
        </div>
        {allowCreate && (
          <Button variant="orange" onClick={() => setDeclareOpen(true)}>
            <Plus size={16} />
            Déclarer un incident
          </Button>
        )}
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Total BT" value={stats.total} icon={<ClipboardList size={18} />} color="navy" />
        <StatCard title="Ouverts" value={stats.open} icon={<Wrench size={18} />} color="blue" />
        <StatCard title="En cours" value={stats.inProgress} icon={<Clock size={18} />} color="amber" />
        <StatCard title="Attente pièces" value={stats.waitingParts} icon={<PackageX size={18} />} color="orange" />
        <StatCard title="Terminés" value={stats.completed} icon={<CheckCircle2 size={18} />} color="green" />
      </div>

      <div className={styles.filtersRow}>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusTab(t.key)}
              className="btn"
              type="button"
              style={{
                background: statusTab === t.key ? "var(--navy)" : "var(--surface)",
                color: statusTab === t.key ? "white" : "var(--foreground)",
                border: `1px solid ${statusTab === t.key ? "var(--navy)" : "var(--border)"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {TYPE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTypeTab(t.key)}
              className="btn btn-outline"
              type="button"
              style={{
                borderColor: typeTab === t.key ? "var(--accent)" : "var(--border)",
                color: typeTab === t.key ? "var(--accent)" : "var(--foreground)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <Empty icon={<Wrench size={24} />} title="Aucun bon de travail" description="Aucun BT ne correspond aux filtres sélectionnés." />
        </div>
      ) : (
        <TableWrap>
          <table>
            <thead>
              <tr>
                <th className="table-header">N° BT</th>
                <th className="table-header">Véhicule</th>
                <th className="table-header">Type</th>
                <th className="table-header">Description</th>
                <th className="table-header">Mécanicien</th>
                <th className="table-header">Date</th>
                <th className="table-header">Coût</th>
                <th className="table-header">Statut</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => {
                const v = vehicles.find((veh) => veh.id === w.vehicleId);
                const m = mechanics.find((mec) => mec.id === w.mechanicId);
                return (
                  <tr key={w.id} className="table-row">
                    <td className="table-cell font-semibold">{w.number}</td>
                    <td className="table-cell">{v?.plate ?? "—"}</td>
                    <td className="table-cell">{BT_TYPE_LABELS[w.type]}</td>
                    <td className="table-cell max-w-[220px] truncate">{w.description}</td>
                    <td className="table-cell">{m ? `${m.firstName} ${m.lastName}` : "—"}</td>
                    <td className="table-cell">{formatDate(w.date)}</td>
                    <td className="table-cell">{formatCurrency(totalCost(w))}</td>
                    <td className="table-cell">
                      <Badge color={BT_STATUS_BADGE[w.status].replace("badge-", "") as any}>
                        {BT_STATUS_LABELS[w.status]}
                      </Badge>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button className="btn-icon" type="button" aria-label="Voir" onClick={() => setViewOrder(w)}>
                          <Eye size={15} />
                        </button>
                        {w.status !== "cloture" && (canCreate(currentUser.role, "maintenance") || currentUser.role === "administrateur") && (
                          <button
                            className="btn-icon"
                            type="button"
                            aria-label="Clôturer"
                            onClick={() => setCloseTarget(w)}
                            style={{ color: "var(--success)" }}
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      )}

      {/* Declare incident modal */}
      <Modal
        open={declareOpen}
        onClose={() => setDeclareOpen(false)}
        title="Déclarer un incident"
        subtitle="Crée un nouveau bon de travail."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeclareOpen(false)}>Annuler</Button>
            <Button variant="orange" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Déclarer</Button>
          </>
        }
      >
        <form className="flex flex-col">
          <Field label="Véhicule" required>
            <Select {...register("vehicleId", { required: true })}>
              <option value="">Sélectionnez un véhicule</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</option>
              ))}
            </Select>
          </Field>
          <Field label="Mécanicien" required>
            <Select {...register("mechanicId", { required: true })} disabled={isMecanicien}>
              <option value="">Sélectionnez un mécanicien</option>
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName} — {m.speciality}</option>
              ))}
            </Select>
          </Field>
          <Field label="Type" required>
            <Select {...register("type")}>
              <option value="corrective">Corrective</option>
              <option value="preventive">Préventive</option>
            </Select>
          </Field>
          <Field label="Date" required>
            <Input type="date" {...register("date", { required: true })} />
          </Field>
          <Field label="Description" error={errors.description?.message} required>
            <Textarea placeholder="Décrivez l'incident constaté..." {...register("description", { required: true, minLength: 5 })} />
          </Field>
        </form>
      </Modal>

      {/* View modal */}
      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title={viewOrder?.number ?? ""}
        subtitle={vehicles.find((v) => v.id === viewOrder?.vehicleId)?.plate}
        size="lg"
      >
        {viewOrder && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge color={BT_STATUS_BADGE[viewOrder.status].replace("badge-", "") as any}>
                {BT_STATUS_LABELS[viewOrder.status]}
              </Badge>
              <Badge color="slate">{BT_TYPE_LABELS[viewOrder.type]}</Badge>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--foreground)" }}>{viewOrder.description}</p>

            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted)" }}>Pièces utilisées</p>
            {viewOrder.parts.length === 0 ? (
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Aucune pièce enregistrée.</p>
            ) : (
              <TableWrap>
                <table>
                  <thead>
                    <tr>
                      <th className="table-header">Réf.</th>
                      <th className="table-header">Désignation</th>
                      <th className="table-header">Qté</th>
                      <th className="table-header">Prix unit.</th>
                      <th className="table-header">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.parts.map((p) => (
                      <tr key={p.id} className="table-row">
                        <td className="table-cell">{p.ref}</td>
                        <td className="table-cell">{p.designation}</td>
                        <td className="table-cell">{p.qty}</td>
                        <td className="table-cell">{formatCurrency(p.unitPrice)}</td>
                        <td className="table-cell font-semibold">{formatCurrency(p.qty * p.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}

            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <DetailMini label="Heures de travail" value={`${viewOrder.hoursWorked} h`} />
              <DetailMini label="Coût horaire" value={formatCurrency(viewOrder.laborCostPerHour)} />
              <DetailMini label="Coût total" value={formatCurrency(totalCost(viewOrder))} />
            </div>

            {viewOrder.observations && (
              <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--foreground)" }}>
                {viewOrder.observations}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Confirm
        open={!!closeTarget}
        onClose={() => setCloseTarget(null)}
        onConfirm={() => {
          if (closeTarget) {
            closeWorkOrder(closeTarget.id);
            showToast("Bon de travail clôturé.", "success");
          }
        }}
        title="Clôturer ce bon de travail ?"
        message={`Le BT ${closeTarget?.number} sera marqué comme clôturé.`}
        variant="primary"
        confirmLabel="Clôturer"
      />
    </AppShell>
  );
}

function DetailMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "var(--surface-2)" }}>
      <p className="text-xs" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>{value}</p>
    </div>
  );
}
