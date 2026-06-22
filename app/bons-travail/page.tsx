"use client";

import styles from "./page.module.css";

import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ClipboardList, Wrench, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Empty, Badge } from "@/components/ui/Shared";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { useToastStore } from "@/lib/toast-store";
import { canCreate } from "@/lib/permissions";
import { workOrderSchema, type WorkOrderInput } from "@/lib/validations";
import { BT_STATUS_BADGE, BT_STATUS_LABELS, BT_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { WorkOrder, BTStatus, User } from "@/types";

const STATUSES: BTStatus[] = ["ouvert", "en_cours", "attente_pieces", "termine", "cloture"];

const emptyForm: WorkOrderInput = {
  vehicleId: "",
  mechanicId: "",
  type: "corrective",
  status: "ouvert",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  hoursWorked: 0,
  laborCostPerHour: 8000,
  observations: "",
  parts: [],
};

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

export default function BonsTravailPage() {
  const currentUser = useAuthStore((s) => s.currentUser) ?? FALLBACK_USER;
  const { vehicles, mechanics, workOrders, addWorkOrder } = useDataStore();
  const showToast = useToastStore((s) => s.show);

  const myMechanic = mechanics.find((m) => m.userId === currentUser.id);
  const isMecanicien = currentUser.role === "mecanicien";
  const allowCreate = canCreate(currentUser.role, "bons-travail");

  const baseOrders = isMecanicien
    ? workOrders.filter((w) => w.mechanicId === myMechanic?.id)
    : workOrders;

  const [formOpen, setFormOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<WorkOrder | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderInput>({
    resolver: zodResolver(workOrderSchema) as any,
    defaultValues: isMecanicien ? { ...emptyForm, mechanicId: myMechanic?.id ?? "" } : emptyForm,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "parts" });

  const watchedParts = watch("parts");
  const hoursWorked = watch("hoursWorked") || 0;
  const laborCostPerHour = watch("laborCostPerHour") || 0;

  const partsTotal = useMemo(
    () => (watchedParts ?? []).reduce((s, p) => s + (Number(p.qty) || 0) * (Number(p.unitPrice) || 0), 0),
    [watchedParts]
  );
  const laborTotal = hoursWorked * laborCostPerHour;
  const grandTotal = partsTotal + laborTotal;

  function totalCost(w: WorkOrder) {
    const pt = w.parts.reduce((s, p) => s + p.qty * p.unitPrice, 0);
    return pt + w.hoursWorked * w.laborCostPerHour;
  }

  function openCreate() {
    reset(isMecanicien ? { ...emptyForm, mechanicId: myMechanic?.id ?? "" } : emptyForm);
    setFormOpen(true);
  }

  function onSubmit(data: WorkOrderInput) {
    addWorkOrder({
      vehicleId: data.vehicleId,
      mechanicId: data.mechanicId,
      type: data.type,
      status: data.status,
      description: data.description,
      date: data.date,
      hoursWorked: data.hoursWorked,
      laborCostPerHour: data.laborCostPerHour,
      observations: data.observations,
      parts: data.parts.map((p, i) => ({ ...p, id: `p_${Date.now()}_${i}` })),
    });
    showToast("Bon de travail créé avec succès.", "success");
    setFormOpen(false);
  }

  return (
    <AppShell title="Bons de Travail">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bons de Travail</h1>
          <p className="page-sub">
            {isMecanicien ? "Vos bons de travail." : "Ensemble des bons de travail émis."}
          </p>
        </div>
        {allowCreate && (
          <Button variant="orange" onClick={openCreate}>
            <Plus size={16} />
            Nouveau BT
          </Button>
        )}
      </div>

      {baseOrders.length === 0 ? (
        <div className="card">
          <Empty icon={<ClipboardList size={24} />} title="Aucun bon de travail" description="Créez un nouveau bon de travail pour commencer." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {baseOrders.map((w) => {
            const v = vehicles.find((veh) => veh.id === w.vehicleId);
            const m = mechanics.find((mec) => mec.id === w.mechanicId);
            return (
              <button
                key={w.id}
                onClick={() => setViewOrder(w)}
                className="card card-p text-left flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{w.number}</span>
                  <Badge color={BT_STATUS_BADGE[w.status].replace("badge-", "") as any}>
                    {BT_STATUS_LABELS[w.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>{v?.plate ?? "—"}</span>
                  <span>·</span>
                  <span>{BT_TYPE_LABELS[w.type]}</span>
                </div>
                <p className="text-sm line-clamp-2" style={{ color: "var(--foreground)" }}>{w.description}</p>
                <div className="flex items-center justify-between text-xs pt-2 mt-auto" style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
                  <span>{m ? `${m.firstName} ${m.lastName}` : "—"}</span>
                  <span className="flex items-center gap-1">
                    <Wrench size={12} /> {w.parts.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {w.hoursWorked}h
                  </span>
                </div>
                <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                  {formatCurrency(totalCost(w))}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* New BT Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nouveau bon de travail"
        subtitle="Renseignez les détails de l'intervention."
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Annuler</Button>
            <Button variant="orange" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Créer le BT</Button>
          </>
        }
      >
        <form className="flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Field label="Véhicule" error={errors.vehicleId?.message} required>
              <Select error={!!errors.vehicleId} {...register("vehicleId")}>
                <option value="">Sélectionnez un véhicule</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</option>
                ))}
              </Select>
            </Field>
            <Field label="Mécanicien" error={errors.mechanicId?.message} required>
              <Select error={!!errors.mechanicId} disabled={isMecanicien} {...register("mechanicId")}>
                <option value="">Sélectionnez un mécanicien</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </Select>
            </Field>
            <Field label="Type" error={errors.type?.message} required>
              <Select error={!!errors.type} {...register("type")}>
                <option value="corrective">Corrective</option>
                <option value="preventive">Préventive</option>
              </Select>
            </Field>
            <Field label="Statut" error={errors.status?.message} required>
              <Select error={!!errors.status} {...register("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{BT_STATUS_LABELS[s]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Date" error={errors.date?.message} required>
              <Input type="date" error={!!errors.date} {...register("date")} />
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message} required>
            <Textarea placeholder="Décrivez l'intervention..." error={!!errors.description} {...register("description")} />
          </Field>

          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Pièces utilisées
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ ref: "", designation: "", qty: 1, unitPrice: 0 })}
            >
              <Plus size={14} /> Ajouter une pièce
            </Button>
          </div>

          {fields.length > 0 && (
            <div className="table-wrap mb-4">
              <table>
                <thead>
                  <tr>
                    <th className="table-header">Réf.</th>
                    <th className="table-header">Désignation</th>
                    <th className="table-header">Qté</th>
                    <th className="table-header">Prix unit.</th>
                    <th className="table-header">Total</th>
                    <th className="table-header"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => {
                    const qty = Number(watchedParts?.[index]?.qty) || 0;
                    const unitPrice = Number(watchedParts?.[index]?.unitPrice) || 0;
                    return (
                      <tr key={field.id} className="table-row">
                        <td className="table-cell" style={{ minWidth: 100 }}>
                          <Input placeholder="REF-001" {...register(`parts.${index}.ref`)} />
                        </td>
                        <td className="table-cell" style={{ minWidth: 160 }}>
                          <Input placeholder="Désignation" {...register(`parts.${index}.designation`)} />
                        </td>
                        <td className="table-cell" style={{ minWidth: 70 }}>
                          <Input type="number" min={1} {...register(`parts.${index}.qty`)} />
                        </td>
                        <td className="table-cell" style={{ minWidth: 100 }}>
                          <Input type="number" min={0} {...register(`parts.${index}.unitPrice`)} />
                        </td>
                        <td className="table-cell font-semibold whitespace-nowrap">
                          {formatCurrency(qty * unitPrice)}
                        </td>
                        <td className="table-cell">
                          <button type="button" className="btn-icon" onClick={() => remove(index)} style={{ color: "var(--critical)" }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Field label="Heures travaillées" error={errors.hoursWorked?.message}>
              <Input type="number" min={0} error={!!errors.hoursWorked} {...register("hoursWorked")} />
            </Field>
            <Field label="Coût main d'œuvre / heure" error={errors.laborCostPerHour?.message}>
              <Input type="number" min={0} error={!!errors.laborCostPerHour} {...register("laborCostPerHour")} />
            </Field>
          </div>

          <Field label="Observations" error={errors.observations?.message}>
            <Textarea placeholder="Remarques complémentaires..." {...register("observations")} />
          </Field>

          <div className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-3" style={{ background: "var(--surface-2)" }}>
            <div className="flex gap-6">
              <div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Pièces</p>
                <p className="font-semibold" style={{ color: "var(--foreground)" }}>{formatCurrency(partsTotal)}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Main d&apos;œuvre</p>
                <p className="font-semibold" style={{ color: "var(--foreground)" }}>{formatCurrency(laborTotal)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--muted)" }}>Coût total</p>
              <p className="text-xl font-bold" style={{ color: "var(--accent)" }}>{formatCurrency(grandTotal)}</p>
            </div>
          </div>
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
              <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>{formatDate(viewOrder.date)}</span>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--foreground)" }}>{viewOrder.description}</p>

            {viewOrder.parts.length > 0 && (
              <div className="table-wrap mb-4">
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
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm">
              <DetailMini label="Heures" value={`${viewOrder.hoursWorked} h`} />
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
