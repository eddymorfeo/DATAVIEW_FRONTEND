'use client'

import { AddFocos } from "@/components/principal/focos/add-focos";
import { AddFocosForm } from "@/components/principal/focos/add-focos-form";
import { Filters } from "@/components/principal/focos/filters";
import { Header } from "@/components/principal/focos/header";
import { Stats } from "@/components/principal/focos/stats";
import { StatsSwitches } from "@/components/principal/focos/stats-switches";
import { Tables } from "@/components/principal/focos/tables";
import type { Foco, FocosFilters } from "@/lib/focos/types";
import { useEffect, useState } from "react";



export default function Focos() {

  const [focos, setFocos] = useState<Foco[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    comuna: "todos",
    estado: "todos",
    analista: "todos",
    fiscal: "todos",
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("focos") || "[]");
    setFocos(data);
  }, []);

    function handleClearFilters() {
    setFilters({
      search: "",
      comuna: "todos",
      estado: "todos",
      analista: "todos",
      fiscal: "todos",
    });
  }

  return (
    <div className="text-foreground">
      <Header />
      <AddFocos />
      <Filters 
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
      />
      {/* <StatsSwitches /> */}
      <Stats filters={filters} focos={focos}/>
      <Tables 
        focos={focos}
        setFocos={setFocos}
        filters={filters}/>
    </div>
  );
}
