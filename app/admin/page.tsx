"use client";

import styles from "./page.module.css";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Pencil,
  Trash2,
  Power,
  Shield,
  Check,
  X as XIcon,
  Truck,
  Wrench,
  ClipboardList,
  Fuel,
  MapPin,
  Bell,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Confirm } from "@/components/ui/Confirm";
import { Field, Input, Select } from "@/components/ui/Field";
import { SearchBar, TableWrap, Empty, Badge, RoleBadge } from "@/components/ui/Shared";
import { useAuthStore } from "@/lib/auth-store";
import { useToastStore } from "@/lib/toast-store";
import {
  ROLE_LABELS,
  ROLE_BADGE_CLASS,
  NAV_ITEMS,
  canAccess,
  canCreate,
  canEdit,
  canDelete,
} from "@/lib/permissions";
import { userSchema, type UserInput } from "@/lib/validations";
import { formatDate, initials } from "@/lib/utils";
import type { Role, User } from "@/types";

type Tab = "utilisateurs" | "roles" | "permissions";

const TABS: { key: Tab; label: string }[] = [
  { key: "utilisateurs", label: "Utilisateurs" },
  { key: "roles", label: "Rôles" },
  { key: "permissions", label: "Permissions" },
];

const ROLES: Role[] = [
  "administrateur",
  "responsable_logistique",
  "chef_atelier",
  "mecanicien",
  "chauffeur",
  "direction",
];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  administrateur: "Accès complet à toutes les fonctionnalités et modules de la plateforme.",
  responsable_logistique: "Gère le parc, le carburant, la logistique et les rapports.",
  chef_atelier: "Supervise la maintenance et les bons de travail de l'atelier.",
  mecanicien: "Exécute et suit ses propres bons de travail assignés.",
  chauffeur: "Consulte ses missions et déclare ses pleins de carburant.",
  direction: "Consulte le tableau de bord et les rapports en lecture.",
};

const ROLE_GRADIENT: Record<Role, string> = {
  administrateur: "linear-gradient(135deg,#f97316,#ea580c)",
  responsable_logistique: "linear-gradient(135deg,#1e3a8a,#1e40af)",
  chef_atelier: "linear-gradient(135deg,#7c3aed,#6d28d9)",
  mecanicien: "linear-gradient(135deg,#475569,#334155)",
  chauffeur: "linear-gradient(135deg,#10b981,#059669)",
  direction: "linear-gradient(135deg,#f59e0b,#d97706)",
};

const MODULE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={15} />,
  parc: <Truck size={15} />,
  maintenance: <Wrench size={15} />,
  "bons-travail": <ClipboardList size={15} />,
  carburant: <Fuel size={15} />,
  logistique: <MapPin size={15} />,
  alertes: <Bell size={15} />,
  rapports: <BarChart3 size={15} />,
  admin: <Shield size={15} />,
};

export default function AdminPage() {
  const { users, addUser, updateUser, deleteUser, toggleUserActive } = useAuthStore();
  const showToast = useToastStore((s) => s.show);

  const [tab, setTab] = useState<Tab>("utilisateurs");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [permRole, setPermRole] = useState<Role>("administrateur");

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.active).length,
      inactive: users.filter((u) => !u.active).length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const full = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserInput>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "chauffeur",
      active: true,
    },
  });

  function openCreate() {
    setEditingUser(null);
    reset({ firstName: "", lastName: "", email: "", phone: "", role: "chauffeur", active: true });
    setFormOpen(true);
  }

  function openEdit(u: User) {
    setEditingUser(u);
    reset({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      active: u.active,
    });
    setFormOpen(true);
  }

  function onSubmit(data: UserInput) {
    if (editingUser) {
      updateUser(editingUser.id, data);
      showToast("Utilisateur mis à jour.", "success");
    } else {
      const exists = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (exists) {
        showToast("Un utilisateur existe déjà avec cet email.", "error");
        return;
      }
      addUser(data);
      showToast("Utilisateur créé avec succès.", "success");
    }
    setFormOpen(false);
  }

  return (
    <AppShell title="Administration">
      <div className="page-header">
        <div>
          <h1 className="page-title">Administration</h1>
          <p className="page-sub">Gestion des utilisateurs, rôles et permissions.</p>
        </div>
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
            {t.label}
          </button>
        ))}
      </div>

      {tab === "utilisateurs" && (
        <div>
          <div className={styles.statsGrid}>
            <StatCard title="Total utilisateurs" value={stats.total} icon={<Users size={18} />} color="navy" />
            <StatCard title="Actifs" value={stats.active} icon={<UserCheck size={18} />} color="green" />
            <StatCard title="Inactifs" value={stats.inactive} icon={<UserX size={18} />} color="red" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un utilisateur..." className="w-64" />
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | "all")} className="w-auto">
                <option value="all">Tous les rôles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </Select>
            </div>
            <Button variant="orange" onClick={openCreate}>
              <Plus size={16} />
              Nouvel utilisateur
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="card">
              <Empty icon={<Users size={24} />} title="Aucun utilisateur" description="Aucun utilisateur ne correspond aux filtres sélectionnés." />
            </div>
          ) : (
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th className="table-header"></th>
                    <th className="table-header">Nom</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Rôle</th>
                    <th className="table-header">Téléphone</th>
                    <th className="table-header">Statut</th>
                    <th className="table-header">Créé le</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="table-row">
                      <td className="table-cell">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{ background: "var(--surface-2)", color: "var(--navy)" }}
                        >
                          {initials(u.firstName, u.lastName)}
                        </div>
                      </td>
                      <td className="table-cell font-semibold">{u.firstName} {u.lastName}</td>
                      <td className="table-cell">{u.email}</td>
                      <td className="table-cell"><RoleBadge role={u.role} /></td>
                      <td className="table-cell">{u.phone}</td>
                      <td className="table-cell">
                        <Badge color={u.active ? "green" : "slate"}>{u.active ? "Actif" : "Inactif"}</Badge>
                      </td>
                      <td className="table-cell">{formatDate(u.createdAt)}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button className="btn-icon" type="button" aria-label="Modifier" onClick={() => openEdit(u)}>
                            <Pencil size={15} />
                          </button>
                          <button
                            className="btn-icon"
                            type="button"
                            aria-label="Activer/désactiver"
                            onClick={() => {
                              toggleUserActive(u.id);
                              showToast(u.active ? "Utilisateur désactivé." : "Utilisateur activé.", "info");
                            }}
                            style={{ color: u.active ? "var(--warning)" : "var(--success)" }}
                          >
                            <Power size={15} />
                          </button>
                          <button
                            className="btn-icon"
                            type="button"
                            aria-label="Supprimer"
                            onClick={() => setDeleteTarget(u)}
                            style={{ color: "var(--critical)" }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </div>
      )}

      {tab === "roles" && (
        <div className={styles.rolesGrid}>
          {ROLES.map((r) => {
            const count = users.filter((u) => u.role === r).length;
            const activeCount = users.filter((u) => u.role === r && u.active).length;
            return (
              <div key={r} className="card card-p">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ background: ROLE_GRADIENT[r] }}
                  >
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                      {ROLE_LABELS[r]}
                    </p>
                    <RoleBadge role={r} />
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                  {ROLE_DESCRIPTIONS[r]}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
                  <span>{count} utilisateur{count !== 1 ? "s" : ""}</span>
                  <span>•</span>
                  <span>{activeCount} actif{activeCount !== 1 ? "s" : ""}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "permissions" && (
        <div>
          <div className={styles.tabBar}>
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setPermRole(r)}
                className="btn"
                style={{
                  background: permRole === r ? "var(--navy)" : "var(--surface)",
                  color: permRole === r ? "white" : "var(--foreground)",
                  border: `1px solid ${permRole === r ? "var(--navy)" : "var(--border)"}`,
                }}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>

          <div className="card">
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th className="table-header">Module</th>
                    <th className="table-header">Accès</th>
                    <th className="table-header">Création</th>
                    <th className="table-header">Modification</th>
                    <th className="table-header">Suppression</th>
                  </tr>
                </thead>
                <tbody>
                  {NAV_ITEMS.map((item) => {
                    const access = canAccess(permRole, item.key);
                    const create = access && canCreate(permRole, item.key);
                    const edit = access && canEdit(permRole, item.key);
                    const del = access && canDelete(permRole, item.key);
                    return (
                      <tr key={item.key} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-2 font-semibold">
                            {MODULE_ICONS[item.key]}
                            {item.label}
                          </div>
                        </td>
                        <PermCell ok={access} />
                        <PermCell ok={create} />
                        <PermCell ok={edit} />
                        <PermCell ok={del} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          </div>
        </div>
      )}

      {/* User form modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Annuler</Button>
            <Button variant="orange" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {editingUser ? "Enregistrer" : "Créer"}
            </Button>
          </>
        }
      >
        <form className="flex flex-col">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" error={errors.firstName?.message} required>
              <Input placeholder="Amadou" {...register("firstName")} />
            </Field>
            <Field label="Nom" error={errors.lastName?.message} required>
              <Input placeholder="Diallo" {...register("lastName")} />
            </Field>
          </div>
          <Field label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="nom@vicas.sn" {...register("email")} />
          </Field>
          <Field label="Téléphone" error={errors.phone?.message} required>
            <Input placeholder="+221 77 000 00 00" {...register("phone")} />
          </Field>
          <Field label="Rôle" error={errors.role?.message} required>
            <Select {...register("role")}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Statut">
            <Select {...register("active", { setValueAs: (v) => v === "true" })}>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </Select>
          </Field>
        </form>
      </Modal>

      <Confirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteUser(deleteTarget.id);
            showToast("Utilisateur supprimé.", "success");
          }
        }}
        title="Supprimer cet utilisateur ?"
        message={`${deleteTarget?.firstName} ${deleteTarget?.lastName} sera définitivement supprimé.`}
        variant="danger"
        confirmLabel="Supprimer"
      />
    </AppShell>
  );
}

function PermCell({ ok }: { ok: boolean }) {
  return (
    <td className="table-cell">
      {ok ? (
        <span className={styles.permOk}>
          <Check size={13} />
        </span>
      ) : (
        <span className={styles.permNo}>
          <XIcon size={13} />
        </span>
      )}
    </td>
  );
}
