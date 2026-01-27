"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, Pencil, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { Homicide, WeaponItem, ComunaItem, CaseStatusItem } from "@/lib/focos/types";

function normalizeRut(value: string): string {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

function formatRutUi(value: string): string {
  const rut = normalizeRut(value);
  if (rut.length < 2) return value;

  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);

  let formatted = "";
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body[i] + formatted;
    count++;
    if (count === 3 && i !== 0) {
      formatted = "." + formatted;
      count = 0;
    }
  }
  return `${formatted}-${dv}`;
}

function toYyyyMmDd(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function truncate(value: string, max = 26) {
  const v = value.trim();
  if (v.length <= max) return v;
  return `${v.slice(0, max)}…`;
}

export type HomicideEditDraft = {
  ruc: string;
  full_name: string;
  rut: string;
  date: string;
  weapon_id: string;
  comuna_id: string;
  case_status_id: string;

  address: string;
  latitude: string;   // string en draft (UI)
  longitude: string;  // string en draft (UI)
};

export type HomicideTableMeta = {
  onDelete: (id: string) => void;
  onLocate: (id: string) => void;

  editingId: string | null;
  draft: HomicideEditDraft | null;

  startEdit: (row: Homicide) => void;
  cancelEdit: () => void;
  saveEdit: () => void;
  patchDraft: (patch: Partial<HomicideEditDraft>) => void;

  // ✅ NUEVO: geocode para edición (autocompletar lat/lng)
  geocodeEditAddress: (id: string) => void | Promise<void>;
  geocodingEdit?: boolean;

  weapons: WeaponItem[];
  comunas: ComunaItem[];
  statuses: CaseStatusItem[];
};

export function homicideColumns(): ColumnDef<Homicide>[] {
  return [
    {
      accessorKey: "ruc",
      header: "RUC",
      cell: ({ row, table }) => {
        const meta = table.options.meta as HomicideTableMeta | undefined;
        const isEditing = meta?.editingId === row.original.id;
        if (!isEditing) return row.original.ruc;

        return (
          <Input
            value={meta?.draft?.ruc ?? ""}
            onChange={(e) => meta?.patchDraft({ ruc: e.target.value })}
            className="h-9 w-45"
          />
        );
      },
    },
    {
      accessorKey: "full_name",
      header: "VÍCTIMA",
      cell: ({ row, table }) => {
        const meta = table.options.meta as HomicideTableMeta | undefined;
        const isEditing = meta?.editingId === row.original.id;
        if (!isEditing) return row.original.full_name ?? "-";

        return (
          <Input
            value={meta?.draft?.full_name ?? ""}
            onChange={(e) => meta?.patchDraft({ full_name: e.target.value })}
            className="h-9 w-45"
          />
        );
      },
    },
    {
      accessorKey: "rut",
      header: "RUT VÍCTIMA",
      cell: ({ row, table }) => {
        const meta = table.options.meta as HomicideTableMeta | undefined;
        const isEditing = meta?.editingId === row.original.id;

        if (!isEditing) {
          const rut = row.original.rut ?? "-";
          return rut === "-" ? "-" : formatRutUi(rut);
        }

        return (
          <Input
            value={meta?.draft?.rut ?? ""}
            onChange={(e) => meta?.patchDraft({ rut: e.target.value })}
            onBlur={() => {
              const raw = (meta?.draft?.rut ?? "").trim();
              if (!raw) return;
              meta?.patchDraft({ rut: formatRutUi(raw) });
            }}
            placeholder="12.345.678-5"
            className="h-9 w-45"
          />
        );
      },
    },
    {
      accessorKey: "date",
      header: "FECHA",
      cell: ({ row, table }) => {
        const meta = table.options.meta as HomicideTableMeta | undefined;
        const isEditing = meta?.editingId === row.original.id;

        if (!isEditing) return toYyyyMmDd(row.original.date) || "-";

        return (
          <Input
            type="date"
            value={meta?.draft?.date ?? ""}
            onChange={(e) => meta?.patchDraft({ date: e.target.value })}
            className="h-9 w-45"
          />
        );
      },
    },
    {
      accessorKey: "weapon_name",
      header: "ARMA",
      cell: ({ row, table }) => {
        const meta = table.options.meta as HomicideTableMeta | undefined;
        const isEditing = meta?.editingId === row.original.id;

        if (!isEditing) return row.original.weapon_name ?? "-";

        return (
          <Select
            value={meta?.draft?.weapon_id ?? ""}
            onValueChange={(v) => meta?.patchDraft({ weapon_id: v })}
          >
            <SelectTrigger className="h-9 w-45">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {meta?.weapons.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "comuna_name",
      header: "COMUNA",
      cell: ({ row, table }) => {
        const meta = table.options.meta as HomicideTableMeta | undefined;
        const isEditing = meta?.editingId === row.original.id;

        if (!isEditing) return row.original.comuna_name ?? "-";

        return (
          <Select
            value={meta?.draft?.comuna_id ?? ""}
            onValueChange={(v) => meta?.patchDraft({ comuna_id: v })}
          >
            <SelectTrigger className="h-9 w-45">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {meta?.comunas.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "case_status_name",
      header: "ESTADO",
      cell: ({ row, table }) => {
        const meta = table.options.meta as HomicideTableMeta | undefined;
        const isEditing = meta?.editingId === row.original.id;

        if (!isEditing) return row.original.case_status_name ?? "-";

        return (
          <Select
            value={meta?.draft?.case_status_id ?? ""}
            onValueChange={(v) => meta?.patchDraft({ case_status_id: v })}
          >
            <SelectTrigger className="h-9 w-45">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {meta?.statuses.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },

    // ✅ DIRECCIÓN (popover)
    {
      id: "address",
      header: "DIRECCIÓN",
      meta: { thClass: "w-[220px]", tdClass: "w-[220px]" },
      cell: ({ row, table }) => {
        const meta = table.options.meta as HomicideTableMeta | undefined;
        const homicide = row.original;
        const isEditing = meta?.editingId === homicide.id;

        const address = (isEditing ? meta?.draft?.address : homicide.address) ?? "";
        const hasAddress = Boolean(address.trim());

        if (!isEditing) {
          if (!hasAddress) return "-";

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span className="truncate text-left">{truncate(address, 26)}</span>
                  <span className="text-muted-foreground text-xs">Ver</span>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80" align="start">
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Dirección</div>
                  <p className="text-sm text-muted-foreground break-words">{address}</p>

                  <div className="pt-1 text-xs text-muted-foreground">
                    Lat: {typeof homicide.latitude === "number" ? homicide.latitude : "-"}
                    <br />
                    Lng: {typeof homicide.longitude === "number" ? homicide.longitude : "-"}
                  </div>

                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-center gap-2"
                      onClick={() => meta?.onLocate(homicide.id)}
                    >
                      <MapPin className="h-4 w-4" />
                      Ubicar en mapa
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        }

        // ✅ Editing
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="truncate text-left">
                  {hasAddress ? truncate(address, 26) : "Sin dirección"}
                </span>
                <span className="text-muted-foreground text-xs">Editar</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80" align="start">
              <div className="space-y-2">
                <div className="text-sm font-semibold">Dirección</div>

                <Input
                  value={meta?.draft?.address ?? ""}
                  onChange={(e) => meta?.patchDraft({ address: e.target.value })}
                  placeholder="Ej: Merced 2558, Santiago"
                />

                <div className="text-sm font-semibold">Latitud</div>
                <Input
                  value={meta?.draft?.latitude ?? ""}
                  readOnly
                  className="bg-muted/40"
                  placeholder="Se cargará automáticamente"
                />

                <div className="text-sm font-semibold">Longitud</div>
                <Input
                  value={meta?.draft?.longitude ?? ""}
                  readOnly
                  className="bg-muted/40"
                  placeholder="Se cargará automáticamente"
                />

                <p className="text-xs text-muted-foreground">
                  Las coordenadas se calculan automáticamente al presionar <b>Ubicar en mapa</b>.
                </p>

                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center gap-2"
                    disabled={Boolean(meta?.geocodingEdit)}
                    onClick={() => meta?.geocodeEditAddress(homicide.id)}
                  >
                    <MapPin className="h-4 w-4" />
                    {meta?.geocodingEdit ? "Ubicando..." : "Ubicar en mapa"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },

{
  id: "actions",
  header: "ACCIONES",
  cell: ({ row, table }) => {
    const meta = table.options.meta as HomicideTableMeta | undefined;
    const id = row.original.id;
    const isEditing = meta?.editingId === id;

    return (
      <div className="flex items-center justify-end gap-2">
        {!isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              title="Ubicar en mapa"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              onClick={() => meta?.onLocate(id)}
            >
              <MapPin className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Editar"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              onClick={() => meta?.startEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Eliminar"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => meta?.onDelete(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              title="Guardar"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              onClick={() => meta?.saveEdit()}
            >
              <Save className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Cancelar"
              className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-950/30"
              onClick={() => meta?.cancelEdit()}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  },
},

  ];
}
