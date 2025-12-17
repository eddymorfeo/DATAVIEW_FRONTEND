import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AddFocosForm } from "./add-focos-form";

export function AddFocos() {
  return (
    <div className="space-y-6 pt-4 mb-8">
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="px-6 py-2">
              + Añadir Nuevo Foco
            </Button>
          </DialogTrigger>
          <AddFocosForm />
        </Dialog>
      </div>
    </div>
  );
}
