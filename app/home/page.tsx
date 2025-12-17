"use client";

import Link from "next/link";
import { sidebarMenu } from "@/components/principal/sidebar/config/menu-sidebar";

export default function Page() {
  
  const panels = sidebarMenu.filter((item) => item.url !== "#");

  return (
    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
      {panels.map((panel) => (
        <Link
          key={panel.name}
          href={panel.url}
          className="
            group
            rounded-xl border border-border 
            bg-card
            hover:bg-accent hover:text-accent-foreground
            transition-all
            shadow-sm
            p-6 flex flex-col gap-4 cursor-pointer
          "
        >
          {/* Icono */}
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
            <panel.icon className="w-6 h-6 text-primary" />
          </div>

          {/* Título */}
          <h2 className="text-xl font-semibold text-foreground">
            {panel.name}
          </h2>

          {/* Descripción */}
          <p className="text-sm text-muted-foreground">
            {panel.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
