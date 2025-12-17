"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export function StatsSwitches() {
  const [filters, setFilters] = useState({
    estado: true,
    comuna: true,
    analista: true,
    fiscal: true,
  });

  return (
    <div className="rounded-xl border bg-card p-6 mb-8">
    <div className=" w-full">
      <h2 className="text-center text-xl font-bold mb-4">Estadísticas Generales</h2>

      <div className="
        w-full 
        rounded-xl 
        border 
        bg-card 
        p-4 
        flex flex-wrap 
        justify-center 
        gap-6
      ">
        
        {/* Por Estado */}
        <div className="flex items-center gap-2">
          <Switch
            checked={filters.estado}
            onCheckedChange={(v) => setFilters({ ...filters, estado: v })}
          />
          <span>Por Estado</span>
        </div>

        {/* Por Comuna */}
        <div className="flex items-center gap-2">
          <Switch
            checked={filters.comuna}
            onCheckedChange={(v) => setFilters({ ...filters, comuna: v })}
          />
          <span>Por Comuna</span>
        </div>

        {/* Por Analista */}
        <div className="flex items-center gap-2">
          <Switch
            checked={filters.analista}
            onCheckedChange={(v) => setFilters({ ...filters, analista: v })}
          />
          <span>Por Analista</span>
        </div>

        {/* Por Fiscal */}
        <div className="flex items-center gap-2">
          <Switch
            checked={filters.fiscal}
            onCheckedChange={(v) => setFilters({ ...filters, fiscal: v })}
          />
          <span>Por Fiscal</span>
        </div>

      </div>
    </div>
    </div>
  );
}
