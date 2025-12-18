"use client";

import { useMemo } from "react";
import { BarChartCard } from "./bar-chart-card";
import type { FocosFilters, Foco } from "@/lib/focos/types";

function groupByCount(items: Foco[], key: keyof Foco) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = item[key];
    if (!value) return acc;
    acc[String(value)] = (acc[String(value)] || 0) + 1;
    return acc;
  }, {});
}

type Props = {
  focos: Foco[];
  filters: FocosFilters;
};

export function Stats({ focos, filters }: Props) {
  /* ================================
     FILTROS (reactivos)
  ================================= */
  const focosFiltrados = useMemo(() => {
    return focos.filter((f) => {
      if (
        filters.search &&
        !`${f.numeroFoco}-${f.anioFoco} ${f.texto}`
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
