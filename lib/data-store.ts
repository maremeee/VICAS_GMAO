// lib/data-store.ts — version mock (sans backend)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MOCK_VEHICLES, MOCK_WORK_ORDERS, MOCK_FUEL_RECORDS,
  MOCK_ASSIGNMENTS, MOCK_ALERTS, MOCK_CHANTIERS,
  MOCK_DRIVERS, MOCK_MECHANICS,
} from "./mock-data";

export const useDataStore = create<any>()(
  persist(
    (set, get) => ({
      vehicles:    MOCK_VEHICLES,
      workOrders:  MOCK_WORK_ORDERS,
      fuelRecords: MOCK_FUEL_RECORDS,
      assignments: MOCK_ASSIGNMENTS,
      alerts:      MOCK_ALERTS,
      chantiers:   MOCK_CHANTIERS,
      drivers:     MOCK_DRIVERS,
      mechanics:   MOCK_MECHANICS,
      loading:     false,
      error:       null,

      fetchAll:         async () => {},
      fetchVehicles:    async () => {},
      fetchWorkOrders:  async () => {},
      fetchFuelRecords: async () => {},
      fetchAssignments: async () => {},
      fetchAlerts:      async () => {},
      fetchChantiers:   async () => {},
      fetchDrivers:     async () => {},
      fetchMechanics:   async () => {},

      addVehicle: (data: any) => set((s: any) => ({
        vehicles: [...s.vehicles, { ...data, id: Date.now().toString() }]
      })),
      updateVehicle: (id: any, data: any) => set((s: any) => ({
        vehicles: s.vehicles.map((v: any) => v.id === id ? { ...v, ...data } : v)
      })),
      deleteVehicle: (id: any) => set((s: any) => ({
        vehicles: s.vehicles.filter((v: any) => v.id !== id)
      })),

      addWorkOrder: (data: any) => set((s: any) => ({
        workOrders: [...s.workOrders, { ...data, id: Date.now().toString() }]
      })),
      updateWorkOrder: (id: any, data: any) => set((s: any) => ({
        workOrders: s.workOrders.map((w: any) => w.id === id ? { ...w, ...data } : w)
      })),
      closeWorkOrder: (id: any) => set((s: any) => ({
        workOrders: s.workOrders.map((w: any) => w.id === id ? { ...w, status: "cloture" } : w)
      })),
      deleteWorkOrder: (id: any) => set((s: any) => ({
        workOrders: s.workOrders.filter((w: any) => w.id !== id)
      })),

      addFuelRecord: (data: any) => set((s: any) => ({
        fuelRecords: [...s.fuelRecords, { ...data, id: Date.now().toString() }]
      })),
      deleteFuelRecord: (id: any) => set((s: any) => ({
        fuelRecords: s.fuelRecords.filter((f: any) => f.id !== id)
      })),

      addAssignment: (data: any) => set((s: any) => ({
        assignments: [...s.assignments, { ...data, id: Date.now().toString() }]
      })),
      endAssignment: (id: any, returnKm: any) => set((s: any) => ({
        assignments: s.assignments.map((a: any) =>
          a.id === id ? { ...a, status: "terminee", returnKm } : a
        )
      })),

      addAlert: (data: any) => set((s: any) => ({
        alerts: [...s.alerts, { ...data, id: Date.now().toString() }]
      })),
      markAlertTreated: (id: any) => set((s: any) => ({
        alerts: s.alerts.map((a: any) =>
          a.id === id ? { ...a, treated: true, treatedAt: new Date().toISOString() } : a
        )
      })),

      addChantier: (data: any) => set((s: any) => ({
        chantiers: [...s.chantiers, { ...data, id: Date.now().toString() }]
      })),
      updateChantier: (id: any, data: any) => set((s: any) => ({
        chantiers: s.chantiers.map((c: any) => c.id === id ? { ...c, ...data } : c)
      })),
      deleteChantier: (id: any) => set((s: any) => ({
        chantiers: s.chantiers.filter((c: any) => c.id !== id)
      })),
    }),
    {
      name: "vicas-data-storage",
    }
  )
);