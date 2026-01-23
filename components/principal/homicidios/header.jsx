"use client";

import { IconMapPin } from "@tabler/icons-react";

export function Header() {
  return (
    <div className="mb-8 flex items-start gap-4">
      {/* Icono */}
      <div className="rounded-lg bg-primary/10 p-3 text-primary dark:bg-primary/20">
        <IconMapPin size={28} />
      </div>

      {/* Títulos */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Monitoreo Homicidios
        </h1>
        <p className="text-muted-foreground">
          Visualiza casos, georreferenciación, estados y estadísticas de homicidios.
        </p>
      </div>
    </div>
  );
}