import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().min(1, "L'email est requis").email("Email invalide"),
    phone: z.string().min(7, "Numéro de téléphone invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
    role: z.enum([
      "administrateur",
      "responsable_logistique",
      "chef_atelier",
      "mecanicien",
      "chauffeur",
      "direction",
    ]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const vehicleSchema = z.object({
  plate: z.string().min(3, "L'immatriculation est requise"),
  type: z.enum([
    "camion",
    "pelleteuse",
    "grue",
    "compacteur",
    "bulldozer",
    "chargeuse",
    "nacelle",
    "vehicule_leger",
  ]),
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  year: z.coerce.number().min(1980).max(2027),
  km: z.coerce.number().min(0),
  hours: z.coerce.number().min(0),
  status: z.enum([
    "disponible",
    "en_mission",
    "en_maintenance",
    "en_panne",
    "hors_service",
  ]),
  fuelType: z.enum(["diesel", "essence"]),
  tankCapacity: z.coerce.number().min(1),
  acquisitionDate: z.string().min(1, "Requis"),
  chassisNumber: z.string().min(1, "Requis"),
  insuranceExpiry: z.string().min(1, "Requis"),
  technicalVisitExpiry: z.string().min(1, "Requis"),
  lastMaintenanceDate: z.string().min(1, "Requis"),
  nextMaintenanceKm: z.coerce.number().min(0),
  site: z.string().optional(),
  notes: z.string().optional(),
});
export type VehicleInput = z.infer<typeof vehicleSchema>;

export const fuelRecordSchema = z.object({
  vehicleId: z.string().min(1, "Sélectionnez un véhicule"),
  date: z.string().min(1, "Requis"),
  fuelType: z.enum(["diesel", "essence"]),
  liters: z.coerce.number().min(0.1, "Quantité requise"),
  cost: z.coerce.number().min(1, "Coût requis"),
  odometer: z.coerce.number().min(0),
  supplier: z.string().min(1, "Fournisseur requis"),
});
export type FuelRecordInput = z.infer<typeof fuelRecordSchema>;

export const assignmentSchema = z.object({
  vehicleId: z.string().min(1, "Sélectionnez un véhicule"),
  driverId: z.string().min(1, "Sélectionnez un chauffeur"),
  chantierId: z.string().min(1, "Sélectionnez un chantier"),
  startDate: z.string().min(1, "Requis"),
  endDate: z.string().optional(),
  departureKm: z.coerce.number().min(0),
  notes: z.string().optional(),
});
export type AssignmentInput = z.infer<typeof assignmentSchema>;

export const workOrderPartSchema = z.object({
  ref: z.string().min(1, "Référence requise"),
  designation: z.string().min(1, "Désignation requise"),
  qty: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
});

export const workOrderSchema = z.object({
  vehicleId: z.string().min(1, "Sélectionnez un véhicule"),
  mechanicId: z.string().min(1, "Sélectionnez un mécanicien"),
  type: z.enum(["preventive", "corrective"]),
  status: z.enum(["ouvert", "en_cours", "attente_pieces", "termine", "cloture"]),
  description: z.string().min(5, "Description requise (5 caractères min.)"),
  date: z.string().min(1, "Requis"),
  hoursWorked: z.coerce.number().min(0),
  laborCostPerHour: z.coerce.number().min(0),
  observations: z.string().optional(),
  parts: z.array(workOrderPartSchema).default([]),
});
export type WorkOrderInput = z.infer<typeof workOrderSchema>;

export const userSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  phone: z.string().min(7, "Numéro de téléphone invalide"),
  role: z.enum([
    "administrateur",
    "responsable_logistique",
    "chef_atelier",
    "mecanicien",
    "chauffeur",
    "direction",
  ]),
  active: z.boolean().default(true),
});
export type UserInput = z.infer<typeof userSchema>;
