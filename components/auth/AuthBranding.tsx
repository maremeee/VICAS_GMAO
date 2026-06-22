"use client";

import { HardHat, Truck, Wrench, ShieldCheck } from "lucide-react";
import { useDataStore } from "@/lib/data-store";

export function AuthBranding() {
  const vehicles = useDataStore((s) => s.vehicles);
  const chantiers = useDataStore((s) => s.chantiers);
  const available = vehicles.filter((v) => v.status === "disponible").length;

  return (
    <div
      className="hidden lg:flex flex-col justify-between w-[44%] min-w-[420px] p-12 relative overflow-hidden"
      style={{ background: "var(--navy)" }}
    >
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-1.5"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <HardHat size={22} color="white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">VICAS GMAO</p>
            <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
              Gestion de Parc &amp; Maintenance
            </p>
          </div>
        </div>

        <h2 className="text-white text-3xl font-bold leading-tight mt-14 max-w-sm">
          Pilotez votre flotte de chantier en toute sérénité.
        </h2>
        <p className="text-sm mt-4 max-w-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          Suivi des engins, maintenance, carburant et missions sur l&apos;ensemble
          de vos chantiers, en un seul espace.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-4">
        <Stat icon={<Truck size={18} />} value={vehicles.length} label="Engins" />
        <Stat icon={<ShieldCheck size={18} />} value={available} label="Disponibles" />
        <Stat icon={<Wrench size={18} />} value={chantiers.length} label="Chantiers" />
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="flex items-center gap-2" style={{ color: "var(--accent)" }}>
        {icon}
      </div>
      <p className="text-white text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
        {label}
      </p>
    </div>
  );
}
