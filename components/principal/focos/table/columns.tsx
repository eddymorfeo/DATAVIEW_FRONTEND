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
import { toast } from "sonner";

function safe(value: string | null | undefined) {
  return value?.trim() ? value : "-";
}

function allTrueDraft(draft: EditDraft | null | undefined) {
  if (!draft) return false;
  return (
    draft.ordenInvestigar &&
    draft.instruccionParticular &&
    draft.diligencias &&
    draft.reunionPolicial &&
    draft.informes &&
    draft.procedimientos
  );
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

  terminadoStatusId: string | null;

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
    header: "Foco",
    meta: { thClass: "w-[60px]", tdClass: "w-[60px]" },
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
    meta: { thClass: "w-[70px]", tdClass: "w-[70px]" },
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
    meta: { thClass: "w-[90px]", tdClass: "w-[90px]" },
    cell: ({ row, table }) => {
      const metaTable = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = metaTable?.editingId === foco.id;

      if (!isEditing) {
        return <span className="block truncate">{safe(foco.title)}</span>;
      }

      return (
        <Input
          className="h-9 w-[90px]"
          value={metaTable?.draft?.title ?? ""}
          onChange={(e) => metaTable?.patchDraft({ title: e.target.value })}
        />
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    meta: { thClass: "w-[130px]", tdClass: "w-[130px]" },
    cell: ({ row, table }) => {
      const metaTable = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = metaTable?.editingId === foco.id;

      if (!isEditing) {
        return (
          <span className="block truncate" title={foco.description ?? ""}>
            {safe(foco.description)}
          </span>
        );
      }

      return (
        <Input
          className="h-9 w-[90px]"
          value={metaTable?.draft?.description ?? ""}
          onChange={(e) => metaTable?.patchDraft({ description: e.target.value })}
        />
      );
    },
  },

  // ✅ Comuna sortable + editable select
  {
    accessorKey: "comuna_name",
    header: "Comuna",
    // ({ column }) => (
    //   <Button
    //     variant="ghost"
    //     className="-ml-4"
    //     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //   >
    //     Comuna
    //     <ArrowUpDown className="ml-2 h-4 w-4" />
    //   </Button>
    // ),
    sortingFn: "alphanumeric",
    meta: { thClass: "w-[130px]", tdClass: "w-[130px] min-w-0" },
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
          <SelectTrigger className="h-9 w-[90px] min-w-0 overflow-hidden">
            <SelectValue className="truncate" placeholder="Selecciona comuna" />
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
    meta: { thClass: "w-[130px]", tdClass: "w-[130px] min-w-0" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return safe(foco.status_name);

      const terminadoId = meta?.terminadoStatusId ?? null;
      const draftAllTrue = allTrueDraft(meta?.draft);

      const isCurrentlyTerminado = Boolean(terminadoId && foco.status_id === terminadoId);
      const isDraftTerminado = Boolean(terminadoId && meta?.draft?.statusId === terminadoId);

      const blockChangeAwayFromTerminado = isCurrentlyTerminado && draftAllTrue;
      // ↑ si está Terminado y todos true, no puede salir de Terminado
      // hasta que baje un subproceso a false.

      return (
        <Select
          value={meta?.draft?.statusId ?? ""}
          onValueChange={(v) => {
            if (!terminadoId) {
              meta?.patchDraft({ statusId: v });
              return;
            }

            const wantsTerminado = v === terminadoId;
            const wantsOther = v !== terminadoId;

            // 1) No dejar seleccionar Terminado si no están todos los subprocesos en true
            if (wantsTerminado && !draftAllTrue) {
              toast.error("No puedes marcar como Terminado", {
                description: "Debes tener todos los subprocesos en Sí (true) antes de terminar.",
              });
              return;
            }

            // 2) No dejar salir de Terminado si todos los subprocesos siguen true
            if (wantsOther && blockChangeAwayFromTerminado) {
              toast.error("No puedes cambiar el estado", {
                description:
                  "Para salir de 'Terminado', primero debes cambiar al menos un subproceso a No (false).",
              });
              return;
            }

            meta?.patchDraft({ statusId: v });
          }}
        >
          <SelectTrigger className="h-9 w-[90px]">
            <SelectValue placeholder="Selecciona estado" />
          </SelectTrigger>

          <SelectContent>
            {(meta?.statuses ?? []).map((s) => {
              const isTerminadoOption = Boolean(terminadoId && s.id === terminadoId);

              // Deshabilitar opción Terminado si no están todos true
              const disableTerminadoOption = isTerminadoOption && !draftAllTrue;

              // Si está Terminado y todos true, deshabilitar cualquier otro estado
              const disableOtherOptions = blockChangeAwayFromTerminado && !isTerminadoOption;

              const disabled = disableTerminadoOption || disableOtherOptions;

              return (
                <SelectItem key={s.id} value={s.id} disabled={disabled}>
                  {s.name}
                </SelectItem>
              );
            })}
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
    meta: { thClass: "w-[180px]", tdClass: "w-[180px] min-w-0" },
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
    header: "Orden Invest.",
    meta: { thClass: "w-[100px]", tdClass: "w-[100px] min-w-0" },
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
    header: "Instr. Partic",
    meta: { thClass: "w-[100px]", tdClass: "w-[100px] min-w-0" },
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
    meta: { thClass: "w-[100px]", tdClass: "w-[100px] min-w-0" },
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
    header: "Reu. Policial",
    meta: { thClass: "w-[100px]", tdClass: "w-[100px] min-w-0" },
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
    meta: { thClass: "w-[100px]", tdClass: "w-[100px] min-w-0" },
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
    header: "Proced.",
    meta: { thClass: "w-[100px]", tdClass: "w-[100px] min-w-0" },
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
    meta: { thClass: "w-[120px]", tdClass: "w-[120px]" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;

      const isEditing = meta?.editingId === foco.id;

      if (isEditing) {
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Guardar cambios"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              onClick={() => meta?.requestUpdate(foco)}
            >
              <Save className="h-4 w-2" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Cancelar"
              className="text-muted-foreground hover:bg-muted/60"
              onClick={() => meta?.cancelEdit()}
            >
              <X className="h-4 w-2" />
            </Button>
          </div>
        );
      }

      const terminateDisabled = meta ? !meta.canTerminate(foco) : true;

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            onClick={() => meta?.startEdit(foco)}
          >
            <Pencil className="h-4 w-2" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Eliminar"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => meta?.requestDelete(foco)}
          >
            <Trash2 className="h-4 w-2" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Terminar"
            disabled={terminateDisabled}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 dark:hover:bg-emerald-950/30"
            onClick={() => meta?.requestTerminate(foco)}
          >
            <CheckCircle2 className="h-4 w-2" />
          </Button>
        </div>
      );
    },
  },

];
