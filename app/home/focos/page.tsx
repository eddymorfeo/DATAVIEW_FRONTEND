"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AddFocos } from "@/components/principal/focos/add-focos";
import { Header } from "@/components/principal/focos/header";
import { DataTable } from "@/components/principal/focos/table/data-table";
import { SummaryRankingCards } from "@/components/principal/focos/chart/summary-ranking-cards";
import { FocosByYearBarChart } from "@/components/principal/focos/chart/focos-by-year-bar-chart";

import { focoColumns, type EditDraft, type FocoTableMeta } from "@/components/principal/focos/table/columns";

import type { Foco } from "@/lib/focos/types";
import { fetchFocos, focoToPayload, updateFoco, deleteFoco } from "@/lib/focos/focos-service";

import {
  fetchAnalistas,
  fetchComunas,
  fetchFiscales,
  fetchFocoStatuses,
  type ComunaItem,
  type UserItem,
  type FocoStatusItem,
} from "@/lib/focos/lookups-service";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

function allTrue(foco: any) {
  return (
    foco.orden_investigar &&
    foco.instruccion_particular &&
    foco.diligencias &&
    foco.reunion_policial &&
    foco.informes &&
    foco.procedimientos
  );
}

function getYearValue(f: any): number | null {
  const raw = f?.foco_year ?? f?.focoYear ?? null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default function Focos() {
  const router = useRouter();
  const [focos, setFocos] = useState<Foco[]>([]);

  // lookups
  const [comunas, setComunas] = useState<ComunaItem[]>([]);
  const [statuses, setStatuses] = useState<FocoStatusItem[]>([]);
  const [analistas, setAnalistas] = useState<UserItem[]>([]);
  const [fiscales, setFiscales] = useState<UserItem[]>([]);

  // edición inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);

  // modales confirmación
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmTerminateOpen, setConfirmTerminateOpen] = useState(false);

  const [pendingFoco, setPendingFoco] = useState<Foco | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ filtros
  const [filterTitle, setFilterTitle] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all"); // ✅ NUEVO
  const [filterComunaId, setFilterComunaId] = useState<string>("all");
  const [filterStatusId, setFilterStatusId] = useState<string>("all");
  const [filterAnalistaId, setFilterAnalistaId] = useState<string>("all");
  const [filterFiscalId, setFilterFiscalId] = useState<string>("all");

  // ====== Cargar focos ======
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchFocos();
        setFocos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        toast.error("No se pudieron cargar los focos", {
          description: e?.message ?? "Error inesperado",
        });
      }
    })();
  }, []);

  // ====== Cargar lookups ======
  useEffect(() => {
    (async () => {
      try {
        const [comunasRes, statusRes, analistasRes, fiscalesRes] = await Promise.all([
          fetchComunas(),
          fetchFocoStatuses(),
          fetchAnalistas(),
          fetchFiscales(),
        ]);

        setComunas(comunasRes);
        setStatuses(statusRes);
        setAnalistas(analistasRes);
        setFiscales(fiscalesRes);
      } catch (e: any) {
        toast.error("No se pudieron cargar los lookups", {
          description: e?.message ?? "Error inesperado",
        });
      }
    })();
  }, []);

  // ====== Helpers nombres ======
  const comunaMap = useMemo(() => new Map(comunas.map((c) => [c.id, c.name])), [comunas]);
  const statusMap = useMemo(() => new Map(statuses.map((s) => [s.id, s.name])), [statuses]);
  const analistaMap = useMemo(() => new Map(analistas.map((u) => [u.id, u.full_name])), [analistas]);
  const fiscalMap = useMemo(() => new Map(fiscales.map((u) => [u.id, u.full_name])), [fiscales]);

  function applyNames(foco: any): any {
    return {
      ...foco,
      comuna_name: foco.comuna_id ? comunaMap.get(foco.comuna_id) ?? foco.comuna_name ?? null : foco.comuna_name ?? null,
      status_name: foco.status_id ? statusMap.get(foco.status_id) ?? foco.status_name ?? null : foco.status_name ?? null,
      analyst_name: foco.analyst_id ? analistaMap.get(foco.analyst_id) ?? foco.analyst_name ?? null : foco.analyst_name ?? null,
      assigned_to_name: foco.assigned_to_id ? fiscalMap.get(foco.assigned_to_id) ?? foco.assigned_to_name ?? null : foco.assigned_to_name ?? null,
    };
  }

  // ====== terminadoStatusId ======
  const terminadoStatusId = useMemo(() => {
    const found = statuses.find((s) => s.name?.toLowerCase() === "terminado");
    return found?.id ?? null;
  }, [statuses]);

  function canTerminate(foco: any) {
    if (!allTrue(foco)) return false;
    if (!terminadoStatusId) return false;
    return (foco.status_id ?? foco.statusId) !== terminadoStatusId;
  }

  function computeIsCompleted(statusId: string) {
    if (!terminadoStatusId) return false;
    return statusId === terminadoStatusId;
  }

  // ====== Edición ======
  function startEdit(foco: any) {
    setEditingId(foco.id);

    setDraft({
      focoNumber: foco.foco_number,
      focoYear: foco.foco_year,
      title: foco.title,
      description: foco.description ?? "",

      comunaId: foco.comuna_id,
      statusId: foco.status_id,
      analystId: foco.analyst_id ?? "",
      assignedToId: foco.assigned_to_id ?? "",

      ordenInvestigar: foco.orden_investigar,
      instruccionParticular: foco.instruccion_particular,
      diligencias: foco.diligencias,
      reunionPolicial: foco.reunion_policial,
      informes: foco.informes,
      procedimientos: foco.procedimientos,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  function patchDraft(patch: Partial<EditDraft>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  // ====== Confirmaciones ======
  function requestUpdate(foco: Foco) {
    setPendingFoco(foco);
    setConfirmUpdateOpen(true);
  }

  function requestDelete(foco: Foco) {
    setPendingFoco(foco);
    setConfirmDeleteOpen(true);
  }

  function requestTerminate(foco: Foco) {
    setPendingFoco(foco);
    setConfirmTerminateOpen(true);
  }

  // ====== Acciones backend ======
  async function doUpdate() {
    if (!pendingFoco || !draft) return;

    try {
      setSaving(true);

      const base = focoToPayload(pendingFoco);
      const nextIsCompleted = computeIsCompleted(draft.statusId);

      const payload = {
        ...base,
        focoNumber: draft.focoNumber,
        focoYear: draft.focoYear,
        title: draft.title,
        description: draft.description,

        comunaId: draft.comunaId,
        statusId: draft.statusId,
        analystId: draft.analystId,
        assignedToId: draft.assignedToId,

        ordenInvestigar: draft.ordenInvestigar,
        instruccionParticular: draft.instruccionParticular,
        diligencias: draft.diligencias,
        reunionPolicial: draft.reunionPolicial,
        informes: draft.informes,
        procedimientos: draft.procedimientos,

        isCompleted: nextIsCompleted,
      };

      const updated = await updateFoco((pendingFoco as any).id, payload);

      setFocos((prev) => prev.map((f: any) => ((f as any).id === (updated as any).id ? applyNames(updated) : f)));

      toast.success("Foco actualizado correctamente");
      cancelEdit();
    } catch (e: any) {
      toast.error("No se pudo actualizar el foco", {
        description: e?.message ?? "Error inesperado",
      });
    } finally {
      setSaving(false);
      setConfirmUpdateOpen(false);
      setPendingFoco(null);
    }
  }

  async function doDelete() {
    if (!pendingFoco) return;

    try {
      setSaving(true);
      await deleteFoco((pendingFoco as any).id);

      setFocos((prev) => prev.filter((f: any) => (f as any).id !== (pendingFoco as any).id));

      toast.success("Foco eliminado correctamente");
      cancelEdit();
    } catch (e: any) {
      toast.error("No se pudo eliminar el foco", {
        description: e?.message ?? "Error inesperado",
      });
    } finally {
      setSaving(false);
      setConfirmDeleteOpen(false);
      setPendingFoco(null);
    }
  }

  async function doTerminate() {
    if (!pendingFoco) return;

    if (!terminadoStatusId) {
      toast.error("No se pudo terminar", {
        description: "No se encontró el estado 'Terminado' en foco_status.",
      });
      setConfirmTerminateOpen(false);
      setPendingFoco(null);
      return;
    }

    if (!canTerminate(pendingFoco as any)) {
      toast.error("No se puede terminar este foco", {
        description: "Debe tener todos los subprocesos en Sí y no estar ya Terminado.",
      });
      setConfirmTerminateOpen(false);
      setPendingFoco(null);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...focoToPayload(pendingFoco),
        statusId: terminadoStatusId,
        isCompleted: true,
      };

      const updated = await updateFoco((pendingFoco as any).id, payload);

      setFocos((prev) => prev.map((f: any) => ((f as any).id === (updated as any).id ? applyNames(updated) : f)));

      toast.success("Foco marcado como Terminado");
      cancelEdit();
    } catch (e: any) {
      toast.error("No se pudo terminar el foco", {
        description: e?.message ?? "Error inesperado",
      });
    } finally {
      setSaving(false);
      setConfirmTerminateOpen(false);
      setPendingFoco(null);
    }
  }

  // ✅ opciones de años (desde todos los focos)
  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    for (const f of focos ?? []) {
      const y = getYearValue(f);
      if (y) years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a); // desc
  }, [focos]);

  // ====== filtrado (tabla + tarjetas + gráfico) ======
  const focosFiltrados = useMemo(() => {
    const q = filterTitle.trim().toLowerCase();
    const yearFilterNumber = filterYear === "all" ? null : Number(filterYear);

    return (focos ?? []).filter((f: any) => {
      const title = (f.title ?? "").toString().toLowerCase();
      const matchTitle = !q || title.includes(q);

      const matchYear =
        yearFilterNumber === null
          ? true
          : Number(f.foco_year ?? f.focoYear ?? 0) === yearFilterNumber;

      const matchComuna = filterComunaId === "all" || (f.comuna_id ?? f.comunaId) === filterComunaId;
      const matchStatus = filterStatusId === "all" || (f.status_id ?? f.statusId) === filterStatusId;
      const matchAnalista = filterAnalistaId === "all" || (f.analyst_id ?? f.analystId) === filterAnalistaId;
      const matchFiscal = filterFiscalId === "all" || (f.assigned_to_id ?? f.assignedToId) === filterFiscalId;

      return matchTitle && matchYear && matchComuna && matchStatus && matchAnalista && matchFiscal;
    });
  }, [focos, filterTitle, filterYear, filterComunaId, filterStatusId, filterAnalistaId, filterFiscalId]);

  function clearFilters() {
    setFilterTitle("");
    setFilterYear("all");
    setFilterComunaId("all");
    setFilterStatusId("all");
    setFilterAnalistaId("all");
    setFilterFiscalId("all");
  }

  // ====== meta para columnas ======
  const tableMeta: FocoTableMeta = useMemo(
    () => ({
      comunas: comunas.map((c) => ({ id: c.id, name: c.name })),
      statuses: statuses.map((s) => ({ id: s.id, name: s.name })),
      analistas: analistas.map((u) => ({ id: u.id, full_name: u.full_name })),
      fiscales: fiscales.map((u) => ({ id: u.id, full_name: u.full_name })),

      editingId,
      draft,

      terminadoStatusId,

      startEdit,
      cancelEdit,
      patchDraft,

      requestUpdate,
      requestDelete,
      requestTerminate,

      canTerminate,
    }),
    [comunas, statuses, analistas, fiscales, editingId, draft, terminadoStatusId]
  );

  return (
    <div className="text-foreground space-y-5" translate="no">
      <Header />

      <div className="flex items-center justify-end gap-2 space-y-4">
        <Button variant="outline" onClick={() => router.push("/home")}>
          Volver
        </Button>

        <AddFocos
          onCreated={(nuevo: any) =>
            setFocos((prev) => (Array.isArray(prev) ? [applyNames(nuevo), ...prev] : [applyNames(nuevo)]))
          }
        />
      </div>

      {/* ✅ Barra de filtros */}
      <div className="rounded-xl border bg-background shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input
              placeholder="Filtrar por título..."
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* ✅ NUEVO: Año */}
          <div className="w-[140px]">
            <Label className="text-xs text-muted-foreground">Año</Label>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="mt-1 h-9 w-full min-w-0 overflow-hidden">
                <SelectValue className="truncate" placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <Label className="text-xs text-muted-foreground">Comuna</Label>
            <Select value={filterComunaId} onValueChange={setFilterComunaId}>
              <SelectTrigger className="mt-1 h-9 w-full min-w-0 overflow-hidden">
                <SelectValue className="truncate" placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {comunas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <Label className="text-xs text-muted-foreground">Estado</Label>
            <Select value={filterStatusId} onValueChange={setFilterStatusId}>
              <SelectTrigger className="mt-1 h-9 w-full min-w-0 overflow-hidden">
                <SelectValue className="truncate" placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <Label className="text-xs text-muted-foreground">Analista</Label>
            <Select value={filterAnalistaId} onValueChange={setFilterAnalistaId}>
              <SelectTrigger className="mt-1 h-9 w-full min-w-0 overflow-hidden">
                <SelectValue className="truncate" placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {analistas.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <Label className="text-xs text-muted-foreground">Fiscal</Label>
            <Select value={filterFiscalId} onValueChange={setFilterFiscalId}>
              <SelectTrigger className="mt-1 h-9 w-full min-w-0 overflow-hidden">
                <SelectValue className="truncate" placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {fiscales.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="secondary" className="h-9" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      </div>

      {/* ✅ Tarjetas ranking (afectadas por filtros) */}
      <SummaryRankingCards focos={focosFiltrados as any[]} />

      {/* ✅ NUEVO: Gráfico barras por año (afectado por filtros) */}
      <FocosByYearBarChart focos={focosFiltrados as any[]} />

      {/* ✅ Tabla (afectada por filtros) */}
      <DataTable columns={focoColumns} data={focosFiltrados} meta={tableMeta} />

      {/* ===== MODAL CONFIRM UPDATE ===== */}
      <AlertDialog open={confirmUpdateOpen} onOpenChange={setConfirmUpdateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar actualización</AlertDialogTitle>
            <AlertDialogDescription>¿Deseas guardar los cambios realizados en este foco?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doUpdate} disabled={saving}>
              {saving ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===== MODAL CONFIRM DELETE ===== */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará el foco seleccionado. ¿Deseas continuar?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={saving}>
              {saving ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===== MODAL CONFIRM TERMINATE ===== */}
      <AlertDialog open={confirmTerminateOpen} onOpenChange={setConfirmTerminateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar término</AlertDialogTitle>
            <AlertDialogDescription>
              Esto cambiará el estado del foco a <b>Terminado</b>. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doTerminate} disabled={saving}>
              {saving ? "Aplicando..." : "Terminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
