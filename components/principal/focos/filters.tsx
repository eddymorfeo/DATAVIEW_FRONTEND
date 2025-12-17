"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Filters() {
  return (
    <div className="rounded-xl border bg-card p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="grid gap-4">
            <Label>Busca por Foco</Label>
            <Input className="w-full" placeholder="Número, Año o Nombre..." />
        </div>
        
        <div className="grid gap-4">
            <Label>Comuna</Label>
            <Select>
                <SelectTrigger className="w-full" ><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        <div className="grid gap-4">
            <Label>Estado del Foco</Label>
            <Select>
                <SelectTrigger className="w-full" ><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="grid gap-4">
            <Label>Analista</Label>
            <Select>
                <SelectTrigger className="w-full" ><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="grid gap-4">
            <Label>Fiscal</Label>
            <Select>
                <SelectTrigger className="w-full" ><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="flex justify-center mt-6 w-full">
        <Button className="w-full md:w-120">Limpiar Filtros</Button>
      </div>
    </div>
  );
}
