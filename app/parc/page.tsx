"use client";

import styles from "./page.module.css";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  Truck,
  Gauge,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Confirm } from "@/components/ui/Confirm";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { SearchBar, TableWrap, Empty, Badge } from "@/components/ui/Shared";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { useToastStore } from "@/lib/toast-store";
import { canCreate, canEdit, canDelete } from "@/lib/permissions";
import { vehicleSchema, type VehicleInput } from "@/lib/validations";
import { VEHICLE_STATUS_BADGE, VEHICLE_STATUS_LABELS, VEHICLE_TYPE_LABELS } from "@/lib/labels";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Vehicle, VehicleStatus, VehicleType, User } from "@/types";

const STATUS_FILTERS: { key: VehicleStatus | "all"; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "disponible", label: "Disponible" },
  { key: "en_mission", label: "En mission" },
  { key: "en_maintenance", label: "Maintenance" },
  { key: "en_panne", label: "En panne" },
  { key: "hors_service", label: "Hors service" },
];

const TYPES: VehicleType[] = [
  "camion",
  "pelleteuse",
  "grue",
  "compacteur",
  "bulldozer",
  "chargeuse",
  "nacelle",
  "vehicule_leger",
];

const STATUSES: VehicleStatus[] = [
  "disponible",
  "en_mission",
  "en_maintenance",
  "en_panne",
  "hors_service",
];

const emptyVehicle: VehicleInput = {
  plate: "",
  type: "camion",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  km: 0,
  hours: 0,
  status: "disponible",
  fuelType: "diesel",
  tankCapacity: 100,
  acquisitionDate: "",
  chassisNumber: "",
  insuranceExpiry: "",
  technicalVisitExpiry: "",
  lastMaintenanceDate: "",
  nextMaintenanceKm: 0,
  site: "",
  notes: "",
};

const columnHelper = createColumnHelper<Vehicle>();

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

export default function ParcPage() {
  const currentUser = useAuthStore((s) => s.currentUser) ?? FALLBACK_USER;
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useDataStore();
  const showToast = useToastStore((s) => s.show);
  const role = currentUser.role;

  const allowCreate = canCreate(role, "parc");
  const allowEdit = canEdit(role, "parc");
  const allowDelete = canDelete(role, "parc");

  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewVehicle, setViewVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: emptyVehicle,
  });

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !v.plate.toLowerCase().includes(q) &&
          !v.brand.toLowerCase().includes(q) &&
          !v.model.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [vehicles, statusFilter, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("plate", { header: "Plaque" }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => VEHICLE_TYPE_LABELS[info.getValue()],
      }),
      columnHelper.display({
        id: "brandModel",
        header: "Marque / Modèle",
        cell: (info) => `${info.row.original.brand} ${info.row.original.model}`,
      }),
      columnHelper.accessor("year", { header: "Année" }),
      columnHelper.accessor("km", {
        header: "Km",
        cell: (info) => (info.getValue() > 0 ? `${formatNumber(info.getValue())} km` : "—"),
      }),
      columnHelper.accessor("hours", {
        header: "Heures",
        cell: (info) => (info.getValue() > 0 ? `${formatNumber(info.getValue())} h` : "—"),
      }),
      columnHelper.accessor("status", {
        header: "Statut",
        cell: (info) => (
          <Badge color={VEHICLE_STATUS_BADGE[info.getValue()].replace("badge-", "") as any}>
            {VEHICLE_STATUS_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-1">
            <button
              className="btn-icon"
              type="button"
              aria-label="Voir"
              onClick={() => setViewVehicle(info.row.original)}
            >
              <Eye size={15} />
            </button>
            {allowEdit && (
              <button
                className="btn-icon"
                type="button"
                aria-label="Modifier"
                onClick={() => openEdit(info.row.original)}
              >
                <Pencil size={15} />
              </button>
            )}
            {allowDelete && (
              <button
                className="btn-icon"
                type="button"
                aria-label="Supprimer"
                onClick={() => setDeleteTarget(info.row.original)}
                style={{ color: "var(--critical)" }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ),
      }),
    ],
    [allowEdit, allowDelete]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function openCreate() {
    setEditingId(null);
    reset(emptyVehicle);
    setFormOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditingId(v.id);
    reset({
      plate: v.plate,
      type: v.type,
      brand: v.brand,
      model: v.model,
      year: v.year,
      km: v.km,
      hours: v.hours,
      status: v.status,
      fuelType: v.fuelType,
      tankCapacity: v.tankCapacity,
      acquisitionDate: v.acquisitionDate,
      chassisNumber: v.chassisNumber,
      insuranceExpiry: v.insuranceExpiry,
      technicalVisitExpiry: v.technicalVisitExpiry,
      lastMaintenanceDate: v.lastMaintenanceDate,
      nextMaintenanceKm: v.nextMaintenanceKm,
      site: v.site ?? "",
      notes: v.notes ?? "",
    });
    setFormOpen(true);
  }

  function onSubmit(data: VehicleInput) {
    if (editingId) {
      updateVehicle(editingId, data);
      showToast("Véhicule mis à jour avec succès.", "success");
    } else {
      addVehicle(data);
      showToast("Véhicule ajouté avec succès.", "success");
    }
    setFormOpen(false);
  }

  return (
    <AppShell title="Parc Engins">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parc Engins</h1>
          <p className="page-sub">Gestion de l&apos;ensemble des véhicules et engins.</p>
        </div>
        {allowCreate && (
          <Button variant="orange" onClick={openCreate}>
            <Plus size={16} />
            Ajouter un engin
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className="btn"
            style={{
              background: statusFilter === f.key ? "var(--navy)" : "var(--surface)",
              color: statusFilter === f.key ? "white" : "var(--foreground)",
              border: `1px solid ${statusFilter === f.key ? "var(--navy)" : "var(--border)"}`,
            }}
            type="button"
          >
            {f.label}
            <span
              className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: statusFilter === f.key ? "rgba(255,255,255,0.2)" : "var(--surface-2)",
              }}
            >
              {f.key === "all" ? vehicles.length : vehicles.filter((v) => v.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-4 max-w-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par plaque, marque, modèle..." />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <Empty icon={<Truck size={24} />} title="Aucun véhicule trouvé" description="Modifiez vos filtres ou ajoutez un nouvel engin." />
        </div>
      ) : (
        <TableWrap>
          <table>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="table-header cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" && <ChevronUp size={12} />}
                        {header.column.getIsSorted() === "desc" && <ChevronDown size={12} />}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="table-row">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="table-cell">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Modifier l'engin" : "Ajouter un engin"}
        subtitle="Renseignez les caractéristiques du véhicule."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button variant="orange" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {editingId ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <form id="vehicle-form" className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="Immatriculation" error={errors.plate?.message} required>
            <Input placeholder="DK-0000-XX" error={!!errors.plate} {...register("plate")} />
          </Field>
          <Field label="Type d'engin" error={errors.type?.message} required>
            <Select error={!!errors.type} {...register("type")}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{VEHICLE_TYPE_LABELS[t]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Marque" error={errors.brand?.message} required>
            <Input placeholder="Mercedes-Benz" error={!!errors.brand} {...register("brand")} />
          </Field>
          <Field label="Modèle" error={errors.model?.message} required>
            <Input placeholder="Actros 3341" error={!!errors.model} {...register("model")} />
          </Field>
          <Field label="Année" error={errors.year?.message} required>
            <Input type="number" error={!!errors.year} {...register("year")} />
          </Field>
          <Field label="Statut" error={errors.status?.message} required>
            <Select error={!!errors.status} {...register("status")}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{VEHICLE_STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Kilométrage" error={errors.km?.message}>
            <Input type="number" error={!!errors.km} {...register("km")} />
          </Field>
          <Field label="Heures d'utilisation" error={errors.hours?.message}>
            <Input type="number" error={!!errors.hours} {...register("hours")} />
          </Field>
          <Field label="Type de carburant" error={errors.fuelType?.message} required>
            <Select error={!!errors.fuelType} {...register("fuelType")}>
              <option value="diesel">Diesel</option>
              <option value="essence">Essence</option>
            </Select>
          </Field>
          <Field label="Capacité réservoir (L)" error={errors.tankCapacity?.message} required>
            <Input type="number" error={!!errors.tankCapacity} {...register("tankCapacity")} />
          </Field>
          <Field label="Date d'acquisition" error={errors.acquisitionDate?.message} required>
            <Input type="date" error={!!errors.acquisitionDate} {...register("acquisitionDate")} />
          </Field>
          <Field label="Numéro de châssis" error={errors.chassisNumber?.message} required>
            <Input error={!!errors.chassisNumber} {...register("chassisNumber")} />
          </Field>
          <Field label="Expiration assurance" error={errors.insuranceExpiry?.message} required>
            <Input type="date" error={!!errors.insuranceExpiry} {...register("insuranceExpiry")} />
          </Field>
          <Field label="Expiration visite technique" error={errors.technicalVisitExpiry?.message} required>
            <Input type="date" error={!!errors.technicalVisitExpiry} {...register("technicalVisitExpiry")} />
          </Field>
          <Field label="Dernier entretien" error={errors.lastMaintenanceDate?.message} required>
            <Input type="date" error={!!errors.lastMaintenanceDate} {...register("lastMaintenanceDate")} />
          </Field>
          <Field label="Prochain entretien (km/h)" error={errors.nextMaintenanceKm?.message}>
            <Input type="number" error={!!errors.nextMaintenanceKm} {...register("nextMaintenanceKm")} />
          </Field>
          <Field label="Chantier assigné" error={errors.site?.message}>
            <Input placeholder="Optionnel" error={!!errors.site} {...register("site")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes" error={errors.notes?.message}>
              <Textarea placeholder="Observations complémentaires..." error={!!errors.notes} {...register("notes")} />
            </Field>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        open={!!viewVehicle}
        onClose={() => setViewVehicle(null)}
        title={viewVehicle?.plate ?? ""}
        subtitle={viewVehicle ? `${viewVehicle.brand} ${viewVehicle.model}` : ""}
        size="lg"
      >
        {viewVehicle && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(30,58,138,0.1)", color: "var(--brand)" }}
              >
                <Truck size={22} />
              </div>
              <div>
                <Badge color={VEHICLE_STATUS_BADGE[viewVehicle.status].replace("badge-", "") as any}>
                  {VEHICLE_STATUS_LABELS[viewVehicle.status]}
                </Badge>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {VEHICLE_TYPE_LABELS[viewVehicle.type]} · {viewVehicle.year}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <DetailItem icon={<Gauge size={14} />} label="Kilométrage" value={viewVehicle.km > 0 ? `${formatNumber(viewVehicle.km)} km` : "—"} />
              <DetailItem icon={<Gauge size={14} />} label="Heures" value={viewVehicle.hours > 0 ? `${formatNumber(viewVehicle.hours)} h` : "—"} />
              <DetailItem label="Carburant" value={viewVehicle.fuelType === "diesel" ? "Diesel" : "Essence"} />
              <DetailItem label="Capacité réservoir" value={`${viewVehicle.tankCapacity} L`} />
              <DetailItem label="Châssis" value={viewVehicle.chassisNumber} />
              <DetailItem icon={<Calendar size={14} />} label="Acquisition" value={formatDate(viewVehicle.acquisitionDate)} />
              <DetailItem icon={<Calendar size={14} />} label="Assurance" value={formatDate(viewVehicle.insuranceExpiry)} />
              <DetailItem icon={<Calendar size={14} />} label="Visite technique" value={formatDate(viewVehicle.technicalVisitExpiry)} />
              <DetailItem icon={<Calendar size={14} />} label="Dernier entretien" value={formatDate(viewVehicle.lastMaintenanceDate)} />
              <DetailItem label="Prochain entretien" value={`${formatNumber(viewVehicle.nextMaintenanceKm)} km/h`} />
              <DetailItem label="Chantier" value={viewVehicle.site ?? "Non assigné"} />
            </div>

            {viewVehicle.notes && (
              <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: "var(--surface-2)", color: "var(--foreground)" }}>
                {viewVehicle.notes}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Confirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteVehicle(deleteTarget.id);
            showToast("Véhicule supprimé.", "success");
          }
        }}
        title="Supprimer ce véhicule ?"
        message={`L'engin ${deleteTarget?.plate} sera définitivement supprimé du parc.`}
        variant="danger"
        confirmLabel="Supprimer"
      />
    </AppShell>
  );
}

function DetailItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>
        {icon}
        {label}
      </p>
      <p className="font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
        {value}
      </p>
    </div>
  );
}
