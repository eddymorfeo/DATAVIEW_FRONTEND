import { AddFocos } from "@/components/principal/focos/add-focos";
import { AddFocosForm } from "@/components/principal/focos/add-focos-form";
import { Filters } from "@/components/principal/focos/filters";
import { Header } from "@/components/principal/focos/header";
import { Stats } from "@/components/principal/focos/stats";
import { StatsSwitches } from "@/components/principal/focos/stats-switches";
import { Tables } from "@/components/principal/focos/tables";

export default function Focos() {
  return (
    <div className="text-foreground">
      <Header />
      <AddFocos />
      <Filters />
      <StatsSwitches />
      <Stats />
      <Tables />
    </div>
  );
}
