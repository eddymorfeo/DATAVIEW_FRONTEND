"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle2, Pencil, Save, Trash2, X } from "lucide-react";

import type { Foco } from "@/lib/focos/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function safe(value: string | null | undefined) {
  return value?.trim() ? value : "-";
}

export type EditDraft = {
  focoNumber: number;
  focoYear: number;
  title: string;
  description: string;

  comunaId: string;
  statusId: string;
  analystId: string;
  assignedToId: string;

  ordenInvestigar: boolean;
  instruccionParticular: boolean;
  diligencias: boolean;
  reunionPolicial: boolean;
  informes: boolean;
  procedimientos: boolean;
};

export type FocoTableMeta = {
  // lookups (para selects)
  comunas: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  analistas: { id: string; full_name: string }[];
  fiscales: { id: string; full_name: string }[];

  // edición
  editingId: string | null;
  draft: EditDraft | null;

  startEdit: (foco: Foco) => void;
  cancelEdit: () => void;
  patchDraft: (patch: Partial<EditDraft>) => void;

  // confirmaciones (page muestra modal y luego ejecuta)
  requestUpdate: (foco: Foco) => void;
  requestDelete: (foco: Foco) => void;
  requestTerminate: (foco: Foco) => void;

  canTerminate: (foco: Foco) => boolean;
};

export const focoColumns: ColumnDef<Foco>[] = [
  {
    accessorKey: "foco_number",
    header: "N° Foco",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;

      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return String(foco.foco_number ?? "");

      return (
        <Input
          className="h-9 w-[50px]"
          value={meta?.draft?.focoNumber ?? 0}
          inputMode="numeric"
          onChange={(e) => meta?.patchDraft({ focoNumber: Number(e.target.value || 0) })}
        />
      );
    },
  },
  {
    accessorKey: "foco_year",
    header: "Año",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return String(foco.foco_year ?? "");

      return (
        <Input
          className="h-9 w-[57px]"
          value={meta?.draft?.focoYear ?? 0}
          inputMode="numeric"
          onChange={(e) => meta?.patchDraft({ focoYear: Number(e.target.value || 0) })}
        />
      );
    },
  },
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return safe(foco.title);

      return (
        <Input
          className="h-9 w-[90px]"
          value={meta?.draft?.title ?? ""}
          onChange={(e) => meta?.patchDraft({ title: e.target.value })}
        />
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) {
        const value = safe(foco.description);
        return value.length > 60 ? `${value.slice(0, 60)}…` : value;
      }

      return (
        <Input
          className="h-9 w-[90px]"
          value={meta?.draft?.description ?? ""}
          onChange={(e) => meta?.patchDraft({ description: e.target.value })}
        />
      );
    },
  },

  // ✅ Comuna sortable + editable select
  {
    accessorKey: "comuna_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Comuna
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    sortingFn: "alphanumeric",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return safe(foco.comuna_name);

      return (
        <Select
          value={meta?.draft?.comunaId ?? ""}
          onValueChange={(v) => meta?.patchDraft({ comunaId: v })}
        >
          <SelectTrigger className="h-9 w-[90px]">
            <SelectValue placeholder="Selecciona comuna" />
          </SelectTrigger>
          <SelectContent>
            {(meta?.comunas ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },

  // Estado select
  {
    accessorKey: "status_name",
    header: "Estado",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return safe(foco.status_name);

      return (
        <Select
          value={meta?.draft?.statusId ?? ""}
          onValueChange={(v) => meta?.patchDraft({ statusId: v })}
        >
          <SelectTrigger className="h-9 w-[90px]">
            <SelectValue placeholder="Selecciona estado" />
          </SelectTrigger>
          <SelectContent>
            {(meta?.statuses ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },

  // Analista select
  {
    accessorKey: "analyst_name",
    header: "Analista",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return safe(foco.analyst_name);

      return (
        <Select
          value={meta?.draft?.analystId ?? ""}
          onValueChange={(v) => meta?.patchDraft({ analystId: v })}
        >
          <SelectTrigger className="h-9 w-[90px]">
            <SelectValue placeholder="Selecciona analista" />
          </SelectTrigger>
          <SelectContent>
            {(meta?.analistas ?? []).map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },

  // Fiscal select
  {
    accessorKey: "assigned_to_name",
    header: "Fiscal",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return safe(foco.assigned_to_name);

      return (
        <Select
          value={meta?.draft?.assignedToId ?? ""}
          onValueChange={(v) => meta?.patchDraft({ assignedToId: v })}
        >
          <SelectTrigger className="h-9 w-[90px]">
            <SelectValue placeholder="Selecciona fiscal" />
          </SelectTrigger>
          <SelectContent>
            {(meta?.fiscales ?? []).map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },

  // Subprocesos: editables con checkbox
  {
    accessorKey: "orden_investigar",
    header: "Orden Investigar",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return foco.orden_investigar ? "Sí" : "No";

      return (
        <div className="flex justify-center">
          <Checkbox
            checked={meta?.draft?.ordenInvestigar ?? false}
            onCheckedChange={(v) => meta?.patchDraft({ ordenInvestigar: Boolean(v) })}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "instruccion_particular",
    header: "Instr. Particular",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return foco.instruccion_particular ? "Sí" : "No";

      return (
        <div className="flex justify-center">
          <Checkbox
            checked={meta?.draft?.instruccionParticular ?? false}
            onCheckedChange={(v) => meta?.patchDraft({ instruccionParticular: Boolean(v) })}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "diligencias",
    header: "Diligencias",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return foco.diligencias ? "Sí" : "No";

      return (
        <div className="flex justify-center">
          <Checkbox
            checked={meta?.draft?.diligencias ?? false}
            onCheckedChange={(v) => meta?.patchDraft({ diligencias: Boolean(v) })}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "reunion_policial",
    header: "Reunión Policial",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return foco.reunion_policial ? "Sí" : "No";

      return (
        <div className="flex justify-center">
          <Checkbox
            checked={meta?.draft?.reunionPolicial ?? false}
            onCheckedChange={(v) => meta?.patchDraft({ reunionPolicial: Boolean(v) })}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "informes",
    header: "Informes",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return foco.informes ? "Sí" : "No";

      return (
        <div className="flex justify-center">
          <Checkbox
            checked={meta?.draft?.informes ?? false}
            onCheckedChange={(v) => meta?.patchDraft({ informes: Boolean(v) })}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "procedimientos",
    header: "Procedimientos",
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return foco.procedimientos ? "Sí" : "No";

      return (
        <div className="flex justify-center">
          <Checkbox
            checked={meta?.draft?.procedimientos ?? false}
            onCheckedChange={(v) => meta?.patchDraft({ procedimientos: Boolean(v) })}
          />
        </div>
      );
    },
  },

  // ✅ Columna Acciones
  {
    id: "acciones",
    header: "Acciones",
    enableHiding: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;

      const isEditing = meta?.editingId === foco.id;

      if (isEditing) {
        return (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              title="Guardar cambios"
              onClick={() => meta?.requestUpdate(foco)}
            >
              <Save className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Cancelar"
              onClick={() => meta?.cancelEdit()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      }

      const terminateDisabled = meta ? !meta.canTerminate(foco) : true;

      return (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            onClick={() => meta?.startEdit(foco)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Eliminar"
            onClick={() => meta?.requestDelete(foco)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Terminar"
            disabled={terminateDisabled}
            onClick={() => meta?.requestTerminate(foco)}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
