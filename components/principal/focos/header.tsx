"use client";

import { IconTrendingUp } from "@tabler/icons-react";

export function Header() {
  return (
    <div className="mb-8 flex items-start gap-4">
      {/* Icono */}
      <div className="rounded-lg bg-primary/10 p-3 text-primary dark:bg-primary/20">
        <IconTrendingUp size={28} />
      </div>

      {/* Títulos */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Focos Delictuales
        </h1>
        <p className="text-muted-foreground">
          Monitorea el avance, estadísticas y gestión de focos investigativos.
        </p>
      </div>
    </div>
  );
}
