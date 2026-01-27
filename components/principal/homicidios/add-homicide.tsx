"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AddHomicideForm } from "./add-homicide-form";

import type { Homicide, WeaponItem, ComunaItem, CaseStatusItem } from "@/lib/focos/types";

type Props = {
  weapons: WeaponItem[];
  comunas: ComunaItem[];
  statuses: CaseStatusItem[];
  onCreated: (h: Homicide) => void;
};

export function AddHomicide({ weapons, comunas, statuses, onCreated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-end">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="px-6 py-2">+ Añadir Nuevo Caso</Button>
        </DialogTrigger>

        <AddHomicideForm
          weapons={weapons}
          comunas={comunas}
          statuses={statuses}
          onCancel={() => setOpen(false)}
          onCreated={(created) => {
            onCreated(created);
            setOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
}
