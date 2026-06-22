import type {
  VehicleStatus,
  VehicleType,
  BTStatus,
  BTType,
  AlertLevel,
  AlertType,
  ChantierStatus,
  AssignmentStatus,
} from "@/types";

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  camion: "Camion",
  pelleteuse: "Pelleteuse",
  grue: "Grue",
  compacteur: "Compacteur",
  bulldozer: "Bulldozer",
  chargeuse: "Chargeuse",
  nacelle: "Nacelle",
  vehicule_leger: "Véhicule léger",
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  disponible: "Disponible",
  en_mission: "En mission",
  en_maintenance: "En maintenance",
  en_panne: "En panne",
  hors_service: "Hors service",
};

export const VEHICLE_STATUS_BADGE: Record<VehicleStatus, string> = {
  disponible: "badge-green",
  en_mission: "badge-blue",
  en_maintenance: "badge-amber",
  en_panne: "badge-orange",
  hors_service: "badge-red",
};

export const BT_STATUS_LABELS: Record<BTStatus, string> = {
  ouvert: "Ouvert",
  en_cours: "En cours",
  attente_pieces: "Attente pièces",
  termine: "Terminé",
  cloture: "Clôturé",
};

export const BT_STATUS_BADGE: Record<BTStatus, string> = {
  ouvert: "badge-blue",
  en_cours: "badge-amber",
  attente_pieces: "badge-orange",
  termine: "badge-green",
  cloture: "badge-slate",
};

export const BT_TYPE_LABELS: Record<BTType, string> = {
  preventive: "Préventive",
  corrective: "Corrective",
};

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  info: "Info",
  warning: "Avertissement",
  danger: "Danger",
  critical: "Critique",
};

export const ALERT_LEVEL_BADGE: Record<AlertLevel, string> = {
  info: "badge-blue",
  warning: "badge-amber",
  danger: "badge-orange",
  critical: "badge-red",
};

export const ALERT_LEVEL_BORDER: Record<AlertLevel, string> = {
  info: "border-l-blue-500",
  warning: "border-l-amber-500",
  danger: "border-l-orange-500",
  critical: "border-l-red-500",
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  vidange: "Vidange",
  revision: "Révision",
  assurance: "Assurance",
  visite_technique: "Visite technique",
  compteur: "Compteur",
};

export const CHANTIER_STATUS_LABELS: Record<ChantierStatus, string> = {
  actif: "Actif",
  termine: "Terminé",
  suspendu: "Suspendu",
};

export const CHANTIER_STATUS_BADGE: Record<ChantierStatus, string> = {
  actif: "badge-green",
  termine: "badge-slate",
  suspendu: "badge-amber",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  active: "En cours",
  terminee: "Terminée",
  planifiee: "Planifiée",
};

export const ASSIGNMENT_STATUS_BADGE: Record<AssignmentStatus, string> = {
  active: "badge-blue",
  terminee: "badge-slate",
  planifiee: "badge-amber",
};

export const DRIVER_STATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  en_mission: "En mission",
  conge: "En congé",
  indisponible: "Indisponible",
};
