"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Pencil, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import type { Foco } from "@/lib/focos/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ✅ MISMA LÓGICA QUE add-focos-form.tsx
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 7 }, (_, i) => `${currentYear - 5 + i}`);

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

function countTrueDraft(draft: EditDraft | null | undefined) {
  if (!draft) return 0;
  const values = [
    draft.ordenInvestigar,
    draft.instruccionParticular,
    draft.diligencias,
    draft.reunionPolicial,
    draft.informes,
    draft.procedimientos,
  ];
  return values.filter(Boolean).length;
}

function countTrueFoco(foco: any) {
  const values = [
    foco?.orden_investigar,
    foco?.instruccion_particular,
    foco?.diligencias,
    foco?.reunion_policial,
    foco?.informes,
    foco?.procedimientos,
  ];
  return values.filter(Boolean).length;
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
  comunas: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  analistas: { id: string; full_name: string }[];
  fiscales: { id: string; full_name: string }[];

  editingId: string | null;
  draft: EditDraft | null;

  terminadoStatusId: string | null;

  startEdit: (foco: Foco) => void;
  cancelEdit: () => void;
  patchDraft: (patch: Partial<EditDraft>) => void;

  requestUpdate: (foco: Foco) => void;
  requestDelete: (foco: Foco) => void;
  requestTerminate: (foco: Foco) => void;

  canTerminate: (foco: Foco) => boolean;
};

export const focoColumns: ColumnDef<Foco>[] = [
  {
    accessorKey: "foco_number",
    header: "Foco",
    meta: { thClass: "w-[70px]", tdClass: "w-[70px]" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return String((foco as any).foco_number ?? "");

      return (
        <Input
          className="h-9 w-full"
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
    meta: { thClass: "w-[90px]", tdClass: "w-[90px]" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original as any;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return String(foco.foco_year ?? "");

      const draftYear = meta?.draft?.focoYear;
      const draftYearStr = draftYear ? String(draftYear) : "";
      const yearSet = new Set(years);
      if (draftYearStr) yearSet.add(draftYearStr);
      const yearOptions = Array.from(yearSet).sort((a, b) => Number(a) - Number(b));

      return (
        <Select
          value={draftYearStr}
          onValueChange={(v) => meta?.patchDraft({ focoYear: Number(v) })}
        >
          <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden">
            <SelectValue className="truncate" placeholder="Año" />
          </SelectTrigger>

          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },

  {
    accessorKey: "title",
    header: "Título",
    meta: { thClass: "w-[140px]", tdClass: "w-[140px]" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return <span className="block truncate">{safe((foco as any).title)}</span>;

      return (
        <Input
          className="h-9 w-full"
          value={meta?.draft?.title ?? ""}
          onChange={(e) => meta?.patchDraft({ title: e.target.value })}
        />
      );
    },
  },

  {
    accessorKey: "description",
    header: "Descripción",
    meta: { thClass: "w-[180px] hidden xl:table-cell", tdClass: "w-[180px] hidden xl:table-cell" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco: any = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) {
        return (
          <span className="block truncate" title={foco.description ?? ""}>
            {safe(foco.description)}
          </span>
        );
      }

      return (
        <Input
          className="h-9 w-full"
          value={meta?.draft?.description ?? ""}
          onChange={(e) => meta?.patchDraft({ description: e.target.value })}
        />
      );
    },
  },

  {
    accessorKey: "comuna_name",
    header: "Comuna",
    meta: { thClass: "w-[150px]", tdClass: "w-[150px] min-w-0" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco: any = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return <span className="block truncate">{safe(foco.comuna_name)}</span>;

      return (
        <Select value={meta?.draft?.comunaId ?? ""} onValueChange={(v) => meta?.patchDraft({ comunaId: v })}>
          <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden">
            <SelectValue className="truncate" placeholder="Comuna" />
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

  {
    accessorKey: "status_name",
    header: "Estado",
    meta: { thClass: "w-[150px]", tdClass: "w-[150px] min-w-0" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco: any = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) {
        const label = safe(foco.status_name);
        const lower = (label ?? "").toString().toLowerCase();
        const variant = lower === "terminado" ? "secondary" : "outline";
        return (
          <Badge variant={variant} className="truncate max-w-[140px]">
            {label}
          </Badge>
        );
      }

      const terminadoId = meta?.terminadoStatusId ?? null;
      const draftAllTrue = allTrueDraft(meta?.draft);

      const isCurrentlyTerminado = Boolean(terminadoId && (foco.status_id ?? foco.statusId) === terminadoId);
      const blockChangeAwayFromTerminado = isCurrentlyTerminado && draftAllTrue;

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

            if (wantsTerminado && !draftAllTrue) {
              toast.error("No puedes marcar como Terminado", {
                description: "Debes tener todos los subprocesos en Sí (true) antes de terminar.",
              });
              return;
            }

            if (wantsOther && blockChangeAwayFromTerminado) {
              toast.error("No puedes cambiar el estado", {
                description: "Para salir de 'Terminado', primero debes cambiar al menos un subproceso a No (false).",
              });
              return;
            }

            meta?.patchDraft({ statusId: v });
          }}
        >
          <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden">
            <SelectValue className="truncate" placeholder="Estado" />
          </SelectTrigger>

          <SelectContent>
            {(meta?.statuses ?? []).map((s) => {
              const isTerminadoOption = Boolean(terminadoId && s.id === terminadoId);
              const disableTerminadoOption = isTerminadoOption && !draftAllTrue;
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

  {
    accessorKey: "analyst_name",
    header: "Analista",
    meta: { thClass: "w-[160px] hidden lg:table-cell", tdClass: "w-[160px] hidden lg:table-cell min-w-0" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco: any = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return <span className="block truncate">{safe(foco.analyst_name)}</span>;

      return (
        <Select value={meta?.draft?.analystId ?? ""} onValueChange={(v) => meta?.patchDraft({ analystId: v })}>
          <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden">
            <SelectValue className="truncate" placeholder="Analista" />
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

  {
    accessorKey: "assigned_to_name",
    header: "Fiscal",
    meta: { thClass: "w-[160px] hidden lg:table-cell", tdClass: "w-[160px] hidden lg:table-cell min-w-0" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco: any = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) return <span className="block truncate">{safe(foco.assigned_to_name)}</span>;

      return (
        <Select value={meta?.draft?.assignedToId ?? ""} onValueChange={(v) => meta?.patchDraft({ assignedToId: v })}>
          <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden">
            <SelectValue className="truncate" placeholder="Fiscal" />
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

  {
    id: "subprocesos",
    header: "Subprocesos",
    meta: { thClass: "w-[130px]", tdClass: "w-[130px]" },
    cell: ({ row, table }) => {
      const meta = table.options.meta as FocoTableMeta | undefined;
      const foco: any = row.original;
      const isEditing = meta?.editingId === foco.id;

      if (!isEditing) {
        const done = countTrueFoco(foco);
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium tabular-nums">{done}/6</span>
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(done / 6) * 100}%` }} />
            </div>
          </div>
        );
      }

      const done = countTrueDraft(meta?.draft);

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <span className="tabular-nums">{done}/6</span>
              <span className="text-muted-foreground text-xs">Editar</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-72" align="start">
            <div className="space-y-2">
              <div className="text-sm font-semibold">Subprocesos</div>

              <div className="grid gap-2">
                {[
                  ["Orden Investigar", "ordenInvestigar"] as const,
                  ["Instr. Particular", "instruccionParticular"] as const,
                  ["Diligencias", "diligencias"] as const,
                  ["Reunión Policial", "reunionPolicial"] as const,
                  ["Informes", "informes"] as const,
                  ["Procedimientos", "procedimientos"] as const,
                ].map(([label, key]) => (
                  <label key={key} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <Checkbox
                      checked={Boolean((meta?.draft as any)?.[key])}
                      onCheckedChange={(v) => meta?.patchDraft({ [key]: Boolean(v) } as any)}
                    />
                  </label>
                ))}
              </div>

              {!allTrueDraft(meta?.draft) ? (
                <p className="text-xs text-muted-foreground">
                  Para marcar <b>Terminado</b>, debes tener los 6 subprocesos en Sí.
                </p>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },

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
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              title="Guardar cambios"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              onClick={() => meta?.requestUpdate(foco)}
            >
              <Save className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Cancelar"
              className="text-muted-foreground hover:bg-muted/60"
              onClick={() => meta?.cancelEdit()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      }

      const terminateDisabled = meta ? !meta.canTerminate(foco) : true;

      return (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            onClick={() => meta?.startEdit(foco)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Eliminar"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => meta?.requestDelete(foco)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Terminar"
            disabled={terminateDisabled}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 dark:hover:bg-emerald-950/30"
            onClick={() => meta?.requestTerminate(foco)}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
