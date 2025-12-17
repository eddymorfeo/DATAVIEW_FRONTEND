"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AddFocosForm() {
  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Añadir Nuevo Foco</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">

        {/* Número y Año */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Número</Label>
            <Input placeholder="Ej: 123" />
          </div>

          <div>
            <Label>Año</Label>
            <Input placeholder="Ej: 2025" />
          </div>
        </div>

        {/* Título */}
        <div>
          <Label>Nombre / Título del Foco</Label>
          <Input placeholder="Ej: Robo de vehículos en..." />
        </div>

        {/* Descripción */}
        <div>
          <Label>Breve descripción del foco</Label>
          <Textarea placeholder="Detalles sobre modus operandi, sector, etc..." />
        </div>

        {/* Comuna – Analista */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Comuna</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Sin Asignar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="n/a">Sin Asignar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Analista</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Sin Asignar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="n/a">Sin Asignar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fiscal */}
        <div>
          <Label>Fiscal Asignado</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Sin Asignar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="n/a">Sin Asignar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="flex justify-between">
        <Button >Cancelar</Button>
        <Button className="">Guardar Foco</Button>
      </DialogFooter>
    </DialogContent>
  );
}
