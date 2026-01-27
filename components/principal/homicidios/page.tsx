"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AddHomicide } from "@/components/principal/homicidios/add-homicide";
import { DataTable } from "@/components/principal/focos/table/data-table"; // ✅ reutilizamos tu DataTable
import { homicideColumns } from "@/components/principal/homicidios/table/columns";
import { HomicidesMap } from "@/components/principal/homicidios/maps/homicides-map";

import type { Homicide, WeaponItem, ComunaItem, CaseStatusItem } from "@/lib/focos/types";
import { fetchHomicides, deleteHomicide } from "@/lib/homicidios/homicidios-service";
import { fetchWeapons, fetchComunas, fetchCaseStatuses } from "@/lib/focos/lookups-service";

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

export default function HomicidiosPage() {
  const [items, setItems] = useState<Homicide[]>([]);
  const [loading, setLoading] = useState(true);

  // lookups (por si el backend aún no trae *_name; igual lo soportamos)
  const [weapons, setWeapons] = useState<WeaponItem[]>([]);
  const [comunas, setComunas] = useState<ComunaItem[]>([]);
  const [statuses, setStatuses] = useState<CaseStatusItem[]>([]);

  // delete confirm
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [hRes, wRes, cRes, sRes] = await Promise.all([
          fetchHomicides({ page: 1, pageSize: 100 }),
          fetchWeapons(),
          fetchComunas(),
          fetchCaseStatuses(),
        ]);

        setItems(hRes.items ?? []);
        setWeapons((wRes ?? []).filter((x) => x.is_active));
        setComunas((cRes ?? []).filter((x) => x.is_active));
        setStatuses((sRes ?? []).filter((x) => x.is_active));
      } catch (e: any) {
        toast.error("No se pudo cargar Homicidios", { description: e?.message ?? "Error inesperado" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const weaponMap = useMemo(() => new Map(weapons.map((w) => [w.id, w.name])), [weapons]);
  const comunaMap = useMemo(() => new Map(comunas.map((c) => [c.id, c.name])), [comunas]);
  const statusMap = useMemo(() => new Map(statuses.map((s) => [s.id, s.name])), [statuses]);

  const rows = useMemo(() => {
    return items.map((h) => ({
      ...h,
      weapon_name: h.weapon_name ?? weaponMap.get(h.weapon_id) ?? null,
      comuna_name: h.comuna_name ?? comunaMap.get(h.comuna_id) ?? null,
      case_status_name: h.case_status_name ?? statusMap.get(h.case_status_id) ?? null,
    }));
  }, [items, weaponMap, comunaMap, statusMap]);

  function requestDelete(id: string) {
    setPendingDeleteId(id);
    setConfirmDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;

    try {
      setDeleting(true);
      await deleteHomicide(pendingDeleteId);
      toast.success("Caso eliminado");
      setItems((prev) => prev.filter((x) => x.id !== pendingDeleteId));
    } catch (e: any) {
      toast.error("No se pudo eliminar", { description: e?.message ?? "Error inesperado" });
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="space-y-8 pt-6">
      <AddHomicide
        weapons={weapons}
        comunas={comunas}
        statuses={statuses}
        onCreated={(created) => {
          toast.success("Caso guardado");
          setItems((prev) => [created, ...prev]);
        }}
      />

      <div className="space-y-4">
        <h2 className="text-center text-xl font-semibold">Listado de Casos</h2>

        <DataTable
          columns={homicideColumns({
            onDelete: (id) => requestDelete(id),
          })}
          data={rows}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-center text-xl font-semibold">Georreferenciación de Casos</h2>
        <HomicidesMap homicides={rows} />
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Caso</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar este caso? (Se eliminará de forma lógica / soft delete según tu backend)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {loading && <p className="text-center text-muted-foreground">Cargando...</p>}
    </div>
  );
}
