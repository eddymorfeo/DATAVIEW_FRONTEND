'use client'

import { AddFocos } from "@/components/principal/focos/add-focos";
import { AddFocosForm } from "@/components/principal/focos/add-focos-form";
import { Filters } from "@/components/principal/focos/filters";
import { Header } from "@/components/principal/focos/header";
import { Stats } from "@/components/principal/focos/stats";
import { StatsSwitches } from "@/components/principal/focos/stats-switches";
import { Tables } from "@/components/principal/focos/tables";
import type { FocosFilters } from "@/lib/focos/types";
import { useState } from "react";

const DEFAULT_FILTERS: FocosFilters = {
  search: "",
  comuna: "todos",
  estado: "todos",
  analista: "todos",
  fiscal: "todos",
};

export default function Focos() {

  const [filters, setFilters] = useState<FocosFilters>(DEFAULT_FILTERS);

  return (
    <div className="text-foreground">
      <Header />
      <AddFocos />
      <Filters 
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(DEFAULT_FILTERS)}
      />
      {/* <StatsSwitches /> */}
      <Stats filters={filters}/>
      <Tables filters={filters}/>
    </div>
  );
}
