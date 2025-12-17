"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { analistas } from "@/lib/focos/analistas";
import { comunas } from "@/lib/focos/comunas";
import { fiscales } from "@/lib/focos/fiscales";
import { estados_focos } from "@/lib/focos/estados-focos";
import { FocosFilters } from "@/lib/focos/types";

type Props = {
  filters: FocosFilters;
  onChange: (filters: FocosFilters) => void;
  onClear: () => void;
};

export function Filters({ filters, onChange, onClear }: Props) {
  return (
    <div className="rounded-xl border bg-card p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* 🔍 Búsqueda */}
        <div className="grid gap-2">
          <Label>Busca por Foco</Label>
          <Input
            className="w-full"
            placeholder="Número, Año o Nombre..."
            value={filters.search}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
          />
        </div>

        {/* 🏘️ Comuna */}
        <div className="grid gap-2">
          <Label>Comuna</Label>
          <Select
            value={filters.comuna}
            onValueChange={(value) =>
              onChange({ ...filters, comuna: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {comunas.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 📌 Estado */}
        <div className="grid gap-2">
          <Label>Estado del Foco</Label>
          <Select
            value={filters.estado}
            onValueChange={(value) =>
              onChange({ ...filters, estado: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {estados_focos.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 👤 Analista */}
        <div className="grid gap-2">
          <Label>Analista</Label>
          <Select
            value={filters.analista}
            onValueChange={(value) =>
              onChange({ ...filters, analista: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {analistas.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ⚖️ Fiscal */}
        <div className="grid gap-2">
          <Label>Fiscal</Label>
          <Select
            value={filters.fiscal}
            onValueChange={(value) =>
              onChange({ ...filters, fiscal: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {fiscales.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🧹 Limpiar */}
      <div className="flex justify-center mt-6 w-full">
        <Button className="w-full md:w-120" onClick={onClear}>
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
}
