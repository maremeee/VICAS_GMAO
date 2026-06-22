import type { Role } from "@/types";

export const ROLE_LABELS: Record<Role, string> = {
  administrateur: "Administrateur",
  responsable_logistique: "Responsable Logistique",
  chef_atelier: "Chef d'Atelier",
  mecanicien: "Mécanicien",
  chauffeur: "Chauffeur",
  direction: "Direction",
};

export const ROLE_BADGE_CLASS: Record<Role, string> = {
  administrateur: "badge-orange",
  responsable_logistique: "badge-blue",
  chef_atelier: "badge-purple",
  mecanicien: "badge-slate",
  chauffeur: "badge-green",
  direction: "badge-amber",
};

export const ROLE_DEFAULT_PAGE: Record<Role, string> = {
  administrateur: "/dashboard",
  responsable_logistique: "/logistique",
  chef_atelier: "/maintenance",
  mecanicien: "/bons-travail",
  chauffeur: "/logistique",
  direction: "/dashboard",
};

export type ModuleKey =
  | "dashboard"
  | "parc"
  | "maintenance"
  | "bons-travail"
  | "carburant"
  | "logistique"
  | "alertes"
  | "rapports"
  | "admin";

// Pages accessible by role
export const ROLE_PAGES: Record<Role, ModuleKey[]> = {
  administrateur: [
    "dashboard",
    "parc",
    "maintenance",
    "bons-travail",
    "carburant",
    "logistique",
    "alertes",
    "rapports",
    "admin",
  ],
  responsable_logistique: [
    "dashboard",
    "parc",
    "carburant",
    "logistique",
    "alertes",
    "rapports",
  ],
  chef_atelier: ["dashboard", "parc", "maintenance", "bons-travail", "alertes"],
  mecanicien: ["dashboard", "maintenance", "bons-travail", "alertes"],
  chauffeur: ["dashboard", "logistique", "carburant", "alertes"],
  direction: ["dashboard", "rapports", "alertes"],
};

export function canAccess(role: Role, page: ModuleKey): boolean {
  return ROLE_PAGES[role].includes(page);
}

export function canCreate(role: Role, page: ModuleKey): boolean {
  if (role === "administrateur") return true;
  switch (page) {
    case "parc":
      return role === "responsable_logistique";
    case "maintenance":
    case "bons-travail":
      return role === "chef_atelier" || role === "mecanicien";
    case "carburant":
      return role === "responsable_logistique" || role === "chauffeur";
    case "logistique":
      return role === "responsable_logistique";
    case "alertes":
      return false;
    default:
      return false;
  }
}

export function canEdit(role: Role, page: ModuleKey): boolean {
  if (role === "administrateur") return true;
  switch (page) {
    case "parc":
      return role === "responsable_logistique";
    case "maintenance":
    case "bons-travail":
      return role === "chef_atelier" || role === "mecanicien";
    case "logistique":
      return role === "responsable_logistique";
    default:
      return false;
  }
}

export function canDelete(role: Role, page: ModuleKey): boolean {
  if (role === "administrateur") return true;
  if (page === "parc") return role === "responsable_logistique";
  return false;
}

export function canTreatAlert(role: Role): boolean {
  return role === "administrateur" || role === "chef_atelier";
}

export function canExportReports(role: Role): boolean {
  return role !== "direction";
}

export const NAV_ITEMS: {
  key: ModuleKey;
  label: string;
  href: string;
  icon: string;
}[] = [
  { key: "dashboard", label: "Tableau de bord", href: "/dashboard", icon: "LayoutDashboard" },
  { key: "parc", label: "Parc Engins", href: "/parc", icon: "Truck" },
  { key: "maintenance", label: "Maintenance", href: "/maintenance", icon: "Wrench" },
  { key: "bons-travail", label: "Bons de Travail", href: "/bons-travail", icon: "ClipboardList" },
  { key: "carburant", label: "Carburant", href: "/carburant", icon: "Fuel" },
  { key: "logistique", label: "Logistique", href: "/logistique", icon: "MapPin" },
  { key: "alertes", label: "Alertes", href: "/alertes", icon: "Bell" },
  { key: "rapports", label: "Rapports", href: "/rapports", icon: "BarChart3" },
  { key: "admin", label: "Administration", href: "/admin", icon: "Shield" },
];
