"use client";

import styles from "./page.module.css";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, MapPin, Truck, CheckCircle2, History, Flag } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Confirm } from "@/components/ui/Confirm";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Empty, Badge } from "@/components/ui/Shared";
import { StatCard } from "@/components/ui/StatCard";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { useToastStore } from "@/lib/toast-store";
import { canCreate } from "@/lib/permissions";
import { assignmentSchema, type AssignmentInput } from "@/lib/validations";
import {
  CHANTIER_STATUS_BADGE,
  CHANTIER_STATUS_LABELS,
  ASSIGNMENT_STATUS_BADGE,
  ASSIGNMENT_STATUS_LABELS,
} from "@/lib/labels";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Assignment, User } from "@/types";

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

export default function LogistiquePage() {
  const currentUser = useAuthStore((s) => s.currentUser) ?? FALLBACK_USER;
  const { vehicles, drivers, chantiers, assignments, addAssignment, endAssignment } = useDataStore();
  const showToast = useToastStore((s) => s.show);

  const isChauffeur = currentUser.role === "chauffeur";
  const myDriver = drivers.find((d) => d.userId === currentUser.id);
  const allowCreate = canCreate(currentUser.role, "logistique");

  const baseAssignments = isChauffeur
    ? assignments.filter((a) => a.driverId === myDriver?.id)
    : assignments;

  const [tab, setTab] = useState<"active" | "history">("active");
  const [formOpen, setFormOpen] = useState(false);
  const [endTarget, setEndTarget] = useState<Assignment | null>(null);
  const [returnKm, setReturnKm] = useState(0);

  const activeMissions = baseAssignments.filter((a) => a.status === "active");
  const historyMissions = baseAssignments.filter((a) => a.status !== "active");

  const kpis = useMemo(() => {
    return {
      activeSites: chantiers.filter((c) => c.status === "actif").length,
      activeMissions: activeMissions.length,
      availableVehicles: vehicles.filter((v) => v.status === "disponible").length,
      availableDrivers: drivers.filter((d) => d.status === "disponible").length,
    };
  }, [chantiers, activeMissions, vehicles, drivers]);

  const availableVehicles = vehicles.filter((v) => v.status === "disponible");
  const availableDrivers = drivers.filter((d) => d.status === "disponible");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentInput>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      vehicleId: "",
      driverId: "",
      chantierId: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      departureKm: 0,
      notes: "",
    },
  });

  function onSubmit(data: AssignmentInput) {
    addAssignment({ ...data, status: "active" });
    showToast("Nouvelle affectation créée.", "success");
    setFormOpen(false);
    reset();
  }

  return (
    <AppShell title="Logistique">
      <div className="page-header">
        <div>
          <h1 className="page-title">Logistique</h1>
          <p className="page-sub">
            {isChauffeur ? "Vos missions et chantiers." : "Gestion des chantiers et affectations véhicules."}
          </p>
        </div>
        {allowCreate && (
          <Button variant="orange" onClick={() => setFormOpen(true)}>
            <Plus size={16} />
            Nouvelle affectation
          </Button>
        )}
      </div>

      <div className={styles.kpiGrid}>
        <StatCard title="Chantiers actifs" value={kpis.activeSites} icon={<MapPin size={18} />} color="navy" />
        <StatCard title="Missions actives" value={kpis.activeMissions} icon={<Truck size={18} />} color="blue" />
        <StatCard title="Véhicules dispo." value={kpis.availableVehicles} icon={<CheckCircle2 size={18} />} color="green" />
        <StatCard title="Chauffeurs dispo." value={kpis.availableDrivers} icon={<Flag size={18} />} color="amber" />
      </div>

      {!isChauffeur && (
        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--foreground)" }}>
            Chantiers actifs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {chantiers.map((c) => (
              <div key={c.id} className="card card-p">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold" style={{ color: "var(--muted)" }}>{c.code}</span>
                  <Badge color={CHANTIER_STATUS_BADGE[c.status].replace("badge-", "") as any}>
                    {CHANTIER_STATUS_LABELS[c.status]}
                  </Badge>
                </div>
                <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{c.name}</p>
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--muted)" }}>
                  <MapPin size={12} /> {c.location}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>Responsable : {c.manager}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <button
          className="btn"
          type="button"
          onClick={() => setTab("active")}
          style={{
            background: tab === "active" ? "var(--navy)" : "var(--surface)",
            color: tab === "active" ? "white" : "var(--foreground)",
            border: `1px solid ${tab === "active" ? "var(--navy)" : "var(--border)"}`,
          }}
        >
          <Truck size={14} /> Missions actives
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => setTab("history")}
          style={{
            background: tab === "history" ? "var(--navy)" : "var(--surface)",
            color: tab === "history" ? "white" : "var(--foreground)",
            border: `1px solid ${tab === "history" ? "var(--navy)" : "var(--border)"}`,
          }}
        >
          <History size={14} /> Historique
        </button>
      </div>

      {(tab === "active" ? activeMissions : historyMissions).length === 0 ? (
        <div className="card">
          <Empty icon={<Truck size={24} />} title="Aucune mission" description="Aucune mission à afficher pour le moment." />
        </div>
      ) : (
        <div className={styles.missionsGrid}>
          {(tab === "active" ? activeMissions : historyMissions).map((a) => {
            const v = vehicles.find((veh) => veh.id === a.vehicleId);
            const d = drivers.find((dr) => dr.id === a.driverId);
            const c = chantiers.find((ch) => ch.id === a.chantierId);
            return (
              <div key={a.id} className="card card-p flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{v?.plate ?? "—"}</span>
                  <Badge color={ASSIGNMENT_STATUS_BADGE[a.status].replace("badge-", "") as any}>
                    {ASSIGNMENT_STATUS_LABELS[a.status]}
                  </Badge>
                </div>
                <p className="text-sm flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                  <MapPin size={13} style={{ color: "var(--muted)" }} /> {c?.name ?? "—"}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Chauffeur : {d ? `${d.firstName} ${d.lastName}` : "—"}
                </p>
                <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted)" }}>
                  <span>Début : {formatDate(a.startDate)}</span>
                  <span>{formatNumber(a.departureKm)} km</span>
                </div>
                {a.notes && (
                  <p className="text-xs italic" style={{ color: "var(--muted)" }}>{a.notes}</p>
                )}
                {a.status === "active" && allowCreate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReturnKm(a.departureKm);
                      setEndTarget(a);
                    }}
                  >
                    Terminer la mission
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New assignment modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nouvelle affectation"
        subtitle="Affectez un véhicule et un chauffeur à un chantier."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Annuler</Button>
            <Button variant="orange" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>Créer</Button>
          </>
        }
      >
        <form>
          <Field label="Véhicule (disponibles uniquement)" error={errors.vehicleId?.message} required>
            <Select error={!!errors.vehicleId} {...register("vehicleId")}>
              <option value="">Sélectionnez un véhicule</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</option>
              ))}
            </Select>
          </Field>
          <Field label="Chauffeur (disponibles uniquement)" error={errors.driverId?.message} required>
            <Select error={!!errors.driverId} {...register("driverId")}>
              <option value="">Sélectionnez un chauffeur</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
              ))}
            </Select>
          </Field>
          <Field label="Chantier" error={errors.chantierId?.message} required>
            <Select error={!!errors.chantierId} {...register("chantierId")}>
              <option value="">Sélectionnez un chantier</option>
              {chantiers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Date de début" error={errors.startDate?.message} required>
              <Input type="date" error={!!errors.startDate} {...register("startDate")} />
            </Field>
            <Field label="Date de fin (optionnel)" error={errors.endDate?.message}>
              <Input type="date" error={!!errors.endDate} {...register("endDate")} />
            </Field>
          </div>
          <Field label="Kilométrage de départ" error={errors.departureKm?.message} required>
            <Input type="number" min={0} error={!!errors.departureKm} {...register("departureKm")} />
          </Field>
          <Field label="Notes" error={errors.notes?.message}>
            <Textarea placeholder="Détails de la mission..." {...register("notes")} />
          </Field>
        </form>
      </Modal>

      <Confirm
        open={!!endTarget}
        onClose={() => setEndTarget(null)}
        onConfirm={() => {
          if (endTarget) {
            endAssignment(endTarget.id, returnKm);
            showToast("Mission terminée avec succès.", "success");
          }
        }}
        title="Terminer cette mission ?"
        message="Le véhicule et le chauffeur seront marqués comme disponibles."
        variant="primary"
        confirmLabel="Terminer"
      />
    </AppShell>
  );
}
