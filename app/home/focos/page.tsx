"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AddFocos } from "@/components/principal/focos/add-focos";
import { Header } from "@/components/principal/focos/header";
import { DataTable } from "@/components/principal/focos/table/data-table";
import {
  focoColumns,
  type EditDraft,
  type FocoTableMeta,
} from "@/components/principal/focos/table/columns";

import type { Foco } from "@/lib/focos/types";
import {
  fetchFocos,
  focoToPayload,
  updateFoco,
  deleteFoco,
} from "@/lib/focos/focos-service";

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

function allTrue(foco: Foco) {
  return (
    foco.orden_investigar &&
    foco.instruccion_particular &&
    foco.diligencias &&
    foco.reunion_policial &&
    foco.informes &&
    foco.procedimientos
  );
}

export default function Focos() {
  const [focos, setFocos] = useState<Foco[]>([]);

  // lookups
  const [comunas, setComunas] = useState<ComunaItem[]>([]);
  const [statuses, setStatuses] = useState<FocoStatusItem[]>([]);
  const [analistas, setAnalistas] = useState<UserItem[]>([]);
  const [fiscales, setFiscales] = useState<UserItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // edición inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);

  // modales confirmación
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmTerminateOpen, setConfirmTerminateOpen] = useState(false);

  const [pendingFoco, setPendingFoco] = useState<Foco | null>(null);
  const [saving, setSaving] = useState(false);

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
        setLoadingLookups(true);

        const [comunasRes, statusRes, analistasRes, fiscalesRes] =
          await Promise.all([
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
      } finally {
        setLoadingLookups(false);
      }
    })();
  }, []);

  // ====== Helpers para mapear nombres ======
  const comunaMap = useMemo(
    () => new Map(comunas.map((c) => [c.id, c.name])),
    [comunas]
  );
  const statusMap = useMemo(
    () => new Map(statuses.map((s) => [s.id, s.name])),
    [statuses]
  );
  const analistaMap = useMemo(
    () => new Map(analistas.map((u) => [u.id, u.full_name])),
    [analistas]
  );
  const fiscalMap = useMemo(
    () => new Map(fiscales.map((u) => [u.id, u.full_name])),
    [fiscales]
  );

  function applyNames(foco: Foco): Foco {
    return {
      ...foco,
      comuna_name: foco.comuna_id
        ? comunaMap.get(foco.comuna_id) ?? foco.comuna_name ?? null
        : foco.comuna_name ?? null,
      status_name: foco.status_id
        ? statusMap.get(foco.status_id) ?? foco.status_name ?? null
        : foco.status_name ?? null,
      analyst_name: foco.analyst_id
        ? analistaMap.get(foco.analyst_id) ?? foco.analyst_name ?? null
        : foco.analyst_name ?? null,
      assigned_to_name: foco.assigned_to_id
        ? fiscalMap.get(foco.assigned_to_id) ?? foco.assigned_to_name ?? null
        : foco.assigned_to_name ?? null,
    };
  }

  // ====== Edición ======
  function startEdit(foco: Foco) {
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

  // ====== Reglas Terminar ======
  const terminadoStatusId = useMemo(() => {
    const found = statuses.find(
      (s) => s.name?.toLowerCase() === "terminado"
    );
    return found?.id ?? null;
  }, [statuses]);

  function canTerminate(foco: Foco) {
    if (!allTrue(foco)) return false;
    if (!terminadoStatusId) return false;
    return foco.status_id !== terminadoStatusId;
  }

  // ✅ Regla central: isCompleted depende del statusId
  function computeIsCompleted(statusId: string) {
    if (!terminadoStatusId) return false; // si no existe lookup, evita marcar true por error
    return statusId === terminadoStatusId;
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

      // ✅ si cambian a Terminado -> true; si cambian a otro -> false
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

        // ✅ CLAVE
        isCompleted: nextIsCompleted,
      };

      const updated = await updateFoco(pendingFoco.id, payload);

      setFocos((prev) =>
        prev.map((f) => (f.id === updated.id ? applyNames(updated) : f))
      );

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
      await deleteFoco(pendingFoco.id);

      setFocos((prev) => prev.filter((f) => f.id !== pendingFoco.id));

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

    if (!canTerminate(pendingFoco)) {
      toast.error("No se puede terminar este foco", {
        description:
          "Debe tener todos los subprocesos en Sí y no estar ya Terminado.",
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

        // ✅ CLAVE: al terminar, marcar completado
        isCompleted: true,
      };

      const updated = await updateFoco(pendingFoco.id, payload);

      setFocos((prev) =>
        prev.map((f) => (f.id === updated.id ? applyNames(updated) : f))
      );

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

  // ====== meta para las columnas ======
  const tableMeta: FocoTableMeta = useMemo(
    () => ({
      comunas: comunas.map((c) => ({ id: c.id, name: c.name })),
      statuses: statuses.map((s) => ({ id: s.id, name: s.name })),
      analistas: analistas.map((u) => ({ id: u.id, full_name: u.full_name })),
      fiscales: fiscales.map((u) => ({ id: u.id, full_name: u.full_name })),

      editingId,
      draft,

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
    <div className="text-foreground">
      <Header />

      <AddFocos
        onCreated={(nuevo) =>
          setFocos((prev) =>
            Array.isArray(prev)
              ? [applyNames(nuevo), ...prev]
              : [applyNames(nuevo)]
          )
        }
      />

      <DataTable columns={focoColumns} data={focos} meta={tableMeta} />

      {/* ===== MODAL CONFIRM UPDATE ===== */}
      <AlertDialog open={confirmUpdateOpen} onOpenChange={setConfirmUpdateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar actualización</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas guardar los cambios realizados en este foco?
            </AlertDialogDescription>
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
            <AlertDialogDescription>
              Esta acción eliminará el foco seleccionado. ¿Deseas continuar?
            </AlertDialogDescription>
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
      <AlertDialog
        open={confirmTerminateOpen}
        onOpenChange={setConfirmTerminateOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar término</AlertDialogTitle>
            <AlertDialogDescription>
              Esto cambiará el estado del foco a <b>Terminado</b>. ¿Deseas
              continuar?
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
