import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Vehicle,
  Chantier,
  Driver,
  Mechanic,
  WorkOrder,
  FuelRecord,
  Assignment,
  Alert,
} from "@/types";
import {
  MOCK_VEHICLES,
  MOCK_CHANTIERS,
  MOCK_DRIVERS,
  MOCK_MECHANICS,
  MOCK_WORK_ORDERS,
  MOCK_FUEL_RECORDS,
  MOCK_ASSIGNMENTS,
  MOCK_ALERTS,
} from "@/lib/mock-data";
import { uid } from "@/lib/utils";

interface DataState {
  vehicles: Vehicle[];
  chantiers: Chantier[];
  drivers: Driver[];
  mechanics: Mechanic[];
  workOrders: WorkOrder[];
  fuelRecords: FuelRecord[];
  assignments: Assignment[];
  alerts: Alert[];

  // Vehicles
  addVehicle: (v: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Work orders
  addWorkOrder: (wo: Omit<WorkOrder, "id" | "number">) => void;
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => void;
  closeWorkOrder: (id: string) => void;
  deleteWorkOrder: (id: string) => void;

  // Fuel
  addFuelRecord: (f: Omit<FuelRecord, "id">) => void;

  // Assignments
  addAssignment: (a: Omit<Assignment, "id">) => void;
  endAssignment: (id: string, returnKm: number) => void;

  // Alerts
  markAlertTreated: (id: string) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      vehicles: MOCK_VEHICLES,
      chantiers: MOCK_CHANTIERS,
      drivers: MOCK_DRIVERS,
      mechanics: MOCK_MECHANICS,
      workOrders: MOCK_WORK_ORDERS,
      fuelRecords: MOCK_FUEL_RECORDS,
      assignments: MOCK_ASSIGNMENTS,
      alerts: MOCK_ALERTS,

      addVehicle: (v) =>
        set({ vehicles: [{ ...v, id: uid("v") }, ...get().vehicles] }),

      updateVehicle: (id, data) =>
        set({
          vehicles: get().vehicles.map((v) =>
            v.id === id ? { ...v, ...data } : v
          ),
        }),

      deleteVehicle: (id) =>
        set({ vehicles: get().vehicles.filter((v) => v.id !== id) }),

      addWorkOrder: (wo) => {
        const count = get().workOrders.length + 41;
        const number = `BT-2026-${String(count).padStart(4, "0")}`;
        set({
          workOrders: [{ ...wo, id: uid("bt"), number }, ...get().workOrders],
        });
      },

      updateWorkOrder: (id, data) =>
        set({
          workOrders: get().workOrders.map((w) =>
            w.id === id ? { ...w, ...data } : w
          ),
        }),

      closeWorkOrder: (id) =>
        set({
          workOrders: get().workOrders.map((w) =>
            w.id === id ? { ...w, status: "cloture" } : w
          ),
        }),

      deleteWorkOrder: (id) =>
        set({ workOrders: get().workOrders.filter((w) => w.id !== id) }),

      addFuelRecord: (f) =>
        set({ fuelRecords: [{ ...f, id: uid("f") }, ...get().fuelRecords] }),

      addAssignment: (a) => {
        set({
          assignments: [{ ...a, id: uid("a") }, ...get().assignments],
          vehicles: get().vehicles.map((v) =>
            v.id === a.vehicleId ? { ...v, status: "en_mission" } : v
          ),
          drivers: get().drivers.map((d) =>
            d.id === a.driverId ? { ...d, status: "en_mission" } : d
          ),
        });
      },

      endAssignment: (id, returnKm) => {
        const assignment = get().assignments.find((a) => a.id === id);
        set({
          assignments: get().assignments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "terminee",
                  endDate: new Date().toISOString().slice(0, 10),
                  returnKm,
                }
              : a
          ),
          vehicles: assignment
            ? get().vehicles.map((v) =>
                v.id === assignment.vehicleId
                  ? { ...v, status: "disponible", km: returnKm > v.km ? returnKm : v.km }
                  : v
              )
            : get().vehicles,
          drivers: assignment
            ? get().drivers.map((d) =>
                d.id === assignment.driverId ? { ...d, status: "disponible" } : d
              )
            : get().drivers,
        });
      },

      markAlertTreated: (id) =>
        set({
          alerts: get().alerts.map((a) =>
            a.id === id
              ? { ...a, treated: true, treatedAt: new Date().toISOString().slice(0, 10) }
              : a
          ),
        }),
    }),
    {
      name: "vicas-data-storage",
    }
  )
);
