import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AddFocosForm } from "./add-focos-form";
import type { Foco } from "@/lib/focos/types";
import { useState } from "react";

type Props = {
  onCreated: (foco: Foco) => void;
};

export function AddFocos({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 pt-4 mb-8">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="px-6 py-2">+ Añadir Nuevo Foco</Button>
          </DialogTrigger>

          <AddFocosForm
            onCreated={(foco) => {
              onCreated(foco);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </Dialog>
      </div>
    </div>
  );
}
