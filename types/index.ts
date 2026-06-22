// ============================================================
// VICAS GMAO — Types globaux
// ============================================================

export type Role =
  | "administrateur"
  | "responsable_logistique"
  | "chef_atelier"
  | "mecanicien"
  | "chauffeur"
  | "direction";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  createdAt: string;
  avatarColor?: string;
}

export type VehicleType =
  | "camion"
  | "pelleteuse"
  | "grue"
  | "compacteur"
  | "bulldozer"
  | "chargeuse"
  | "nacelle"
  | "vehicule_leger";

export type VehicleStatus =
  | "disponible"
  | "en_mission"
  | "en_maintenance"
  | "en_panne"
  | "hors_service";

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  km: number;
  hours: number;
  status: VehicleStatus;
  fuelType: "diesel" | "essence";
  tankCapacity: number;
  acquisitionDate: string;
  chassisNumber: string;
  insuranceExpiry: string;
  technicalVisitExpiry: string;
  lastMaintenanceDate: string;
  nextMaintenanceKm: number;
  site?: string;
  notes?: string;
}

export type ChantierStatus = "actif" | "termine" | "suspendu";

export interface Chantier {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  status: ChantierStatus;
  startDate: string;
  endDate?: string;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "disponible" | "en_mission" | "conge" | "indisponible";
  userId?: string;
}

export interface Mechanic {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  speciality: string;
  userId?: string;
}

export type BTStatus =
  | "ouvert"
  | "en_cours"
  | "attente_pieces"
  | "termine"
  | "cloture";

export type BTType = "preventive" | "corrective";

export interface BTPart {
  id: string;
  ref: string;
  designation: string;
  qty: number;
  unitPrice: number;
}

export interface WorkOrder {
  id: string;
  number: string;
  vehicleId: string;
  type: BTType;
  description: string;
  mechanicId: string;
  date: string;
  status: BTStatus;
  parts: BTPart[];
  hoursWorked: number;
  laborCostPerHour: number;
  observations?: string;
}

export type FuelType = "diesel" | "essence";

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  fuelType: FuelType;
  liters: number;
  cost: number;
  odometer: number;
  supplier: string;
  driverId?: string;
}

export type AssignmentStatus = "active" | "terminee" | "planifiee";

export interface Assignment {
  id: string;
  vehicleId: string;
  driverId: string;
  chantierId: string;
  startDate: string;
  endDate?: string;
  departureKm: number;
  returnKm?: number;
  status: AssignmentStatus;
  notes?: string;
}

export type AlertLevel = "info" | "warning" | "danger" | "critical";

export type AlertType =
  | "vidange"
  | "revision"
  | "assurance"
  | "visite_technique"
  | "compteur";

export interface Alert {
  id: string;
  vehicleId: string;
  type: AlertType;
  level: AlertLevel;
  message: string;
  createdAt: string;
  dueDate: string;
  treated: boolean;
  treatedAt?: string;
}
