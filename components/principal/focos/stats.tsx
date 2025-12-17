"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChartCard } from "./bar-chart-card";
import type { FocosFilters } from "@/lib/focos/types";

type Foco = {
  numeroFoco: string;
  anioFoco: string;
  texto: string;
  estadoFoco: string;
  comuna: string;
  analista: string;
  asignadoA: string;
};

function groupByCount(items: Foco[], key: keyof Foco) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = item[key];
    if (!value) return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function Stats({ filters }: { filters: FocosFilters }) {
  const [focos, setFocos] = useState<Foco[]>([]);

  useEffect(() => {
    setFocos(JSON.parse(localStorage.getItem("focos") || "[]"));
  }, []);

  const focosFiltrados = useMemo(() => {
    return focos.filter((f) => {
      if (
        filters.search &&
        !`${f.numeroFoco} ${f.anioFoco} ${f.texto}`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      )
        return false;

      if (filters.comuna !== "todos" && f.comuna !== filters.comuna)
        return false;

      if (filters.estado !== "todos" && f.estadoFoco !== filters.estado)
        return false;

      if (filters.analista !== "todos" && f.analista !== filters.analista)
        return false;
      
      if (filters.fiscal !== "todos" && f.asignadoA !== filters.fiscal)
        return false;

      return true;
    });
  }, [focos, filters]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <BarChartCard
        title="Focos por Estado"
        data={groupByCount(focosFiltrados, "estadoFoco")}
      />
      <BarChartCard
        title="Focos por Comuna"
        data={groupByCount(focosFiltrados, "comuna")}
      />
      <BarChartCard
        title="Focos por Analista"
        data={groupByCount(focosFiltrados, "analista")}
      />
      <BarChartCard
        title="Focos por Fiscal"
        data={groupByCount(focosFiltrados, "asignadoA")}
      />
    </div>
  );
}
