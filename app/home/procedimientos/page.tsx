"use client";

import { Header } from "@/components/principal/procedimientos/header";
import ProcedureWizard from "@/components/principal/procedimientos/stepps/ProcedureWizard";
import StepperizeExample from "@/components/principal/procedimientos/stepps/StepperizeExample";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Procedimientos() {

  const router = useRouter();

  return (
    <div className="text-foreground" translate="no">
      <Header />

      <div className="flex items-center justify-end gap-2 space-y-4">
        <Button variant="outline" onClick={() => router.push("/home")}>
          Volver
        </Button>
      </div>

      {/* <StepperizeExample /> */}

      {/* <ProcedureWizard /> */}

    </div>
  );
}
