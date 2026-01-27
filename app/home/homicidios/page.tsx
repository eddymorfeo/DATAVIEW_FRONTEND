"use client";

import { Header } from "@/components/principal/Homicidios/header";
import HomicidiosPage from "@/components/principal/homicidios/page";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Homicidios() {

    const router = useRouter();

  return (
    <div className="text-foreground" translate="no">
      <Header />

      <div className="flex items-center justify-end gap-2 space-y-4">
        <Button variant="outline" onClick={() => router.push("/home")}>
          Volver
        </Button>        
      </div>

      <HomicidiosPage />
    </div>
  );
}
