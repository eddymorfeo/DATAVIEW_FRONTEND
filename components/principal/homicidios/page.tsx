"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

import { AddHomicide } from "@/components/principal/homicidios/add-homicide";
import { DataTable } from "@/components/principal/focos/table/data-table";
import {
  homicideColumns,
  type HomicideEditDraft,
  type HomicideTableMeta,
} from "@/components/principal/homicidios/table/columns";
import { HomicidesMap } from "@/components/principal/homicidios/maps/homicides-map";

import type {
  Homicide,
  WeaponItem,
  ComunaItem,
  CaseStatusItem,
} from "@/lib/focos/types";

import {
  fetchHomicides,
  deleteHomicide,
  updateHomicide,
} from "@/lib/homicidios/homicidios-service";

import {
  fetchWeapons,
  fetchComunas,
  fetchCaseStatuses,
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

/** RUT helpers (para validar/guardar BBDD) */
function normalizeRut(value: string): string {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}
function computeRutDv(bodyDigits: string): string {
  let sum = 0;
  let mul = 2;
  for (let i = bodyDigits.length - 1; i >= 0; i--) {
    sum += Number(bodyDigits[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const mod = 11 - (sum % 11);
  if (mod === 11) return "0";
  if (mod === 10) return "K";
  return String(mod);
}
function isValidRut(value: string): boolean {
  const rut = normalizeRut(value);
  if (rut.length < 2) return false;
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  if (!/^[0-9K]$/.test(dv)) return false;
  if (Number(body) <= 0) return false;
  return dv === computeRutDv(body);
}
function toDbRut(value: string): string {
  const rut = normalizeRut(value);
  if (rut.length < 2) return rut;
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  return `${body}-${dv}`;
}

function parseNullableNumber(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number; label: string } | null> {
  const q = address.trim();
  if (!q) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q
  )}&limit=1&accept-language=es`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoding falló (${res.status})`);

  const data = (await res.json()) as any[];
  if (!Array.isArray(data) || data.length === 0) return null;

  const item = data[0];
  return {
    lat: Number(item.lat),
    lng: Number(item.lon),
    label: item.display_name ?? q,
  };
}

export default function HomicidiosPage() {
  const [items, setItems] = useState<Homicide[]>([]);
  const [loading, setLoading] = useState(true);

  const [weapons, setWeapons] = useState<WeaponItem[]>([]);
  const [comunas, setComunas] = useState<ComunaItem[]>([]);
  const [statuses, setStatuses] = useState<CaseStatusItem[]>([]);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<HomicideEditDraft | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // foco del mapa
  const [focusId, setFocusId] = useState<string | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ lat: number; lng: number } | null>(null);

  // geocode en edición
  const [geocodingEdit, setGeocodingEdit] = useState(false);

  const mapSectionRef = useRef<HTMLDivElement | null>(null);

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
        toast.error("No se pudo cargar Homicidios", {
          description: e?.message ?? "Error inesperado",
        });
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

  const requestDelete = useCallback((id: string) => {
    setPendingDeleteId(id);
    setConfirmDeleteOpen(true);
  }, []);

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

  const startEdit = useCallback((row: Homicide) => {
    const dateValue = row.date ? new Date(row.date).toISOString().slice(0, 10) : "";

    const latStr = row.latitude === null || row.latitude === undefined ? "" : String(row.latitude);
    const lngStr = row.longitude === null || row.longitude === undefined ? "" : String(row.longitude);

    setEditingId(row.id);
    setDraft({
      ruc: row.ruc ?? "",
      full_name: row.full_name ?? "",
      rut: row.rut ?? "",
      date: dateValue,
      weapon_id: row.weapon_id ?? "",
      comuna_id: row.comuna_id ?? "",
      case_status_id: row.case_status_id ?? "",
      address: row.address ?? "",
      latitude: latStr,
      longitude: lngStr,
    });

    // al entrar a editar, no forces foco
    setFocusId(null);
    setFocusPoint(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setDraft(null);
    setGeocodingEdit(false);
  }, []);

  const patchDraft = useCallback((patch: Partial<HomicideEditDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  // ✅ este es el handler clave: geocodifica la dirección y autocompleta lat/lng (bloqueados)
  const geocodeEditAddress = useCallback(
    async (id: string) => {
      if (!editingId || !draft || editingId !== id) return;

      const addr = draft.address.trim();
      if (!addr) {
        toast.error("Ingresa una dirección", { description: "La dirección no puede ir vacía." });
        return;
      }

      try {
        setGeocodingEdit(true);

        const found = await geocodeAddress(addr);
        if (!found) {
          toast.error("Dirección no encontrada", {
            description: "Prueba con un formato más específico (ej: Merced 2558, Santiago).",
          });
          return;
        }

        // ✅ autocompleta coords y normaliza el texto de dirección
        patchDraft({
          address: found.label,
          latitude: found.lat.toFixed(6),
          longitude: found.lng.toFixed(6),
        });

        // ✅ mueve el mapa inmediatamente (sin necesidad de guardar)
        setFocusId(null);
        setFocusPoint({ lat: found.lat, lng: found.lng });
        mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

        toast.success("Dirección ubicada y coordenadas actualizadas");
      } catch (e: any) {
        toast.error("No se pudo ubicar la dirección", { description: e?.message ?? "Error inesperado" });
      } finally {
        setGeocodingEdit(false);
      }
    },
    [editingId, draft, patchDraft]
  );

  const saveEdit = useCallback(async () => {
    if (!editingId || !draft) return;

    if (!draft.ruc.trim()) {
      toast.error("No se puede guardar", { description: "RUC es obligatorio." });
      return;
    }
    if (!draft.date.trim()) {
      toast.error("No se puede guardar", { description: "Fecha del hecho es obligatoria." });
      return;
    }
    if (!draft.full_name.trim()) {
      toast.error("No se puede guardar", { description: "Nombre de la víctima es obligatorio." });
      return;
    }
    if (!draft.rut.trim() || !isValidRut(draft.rut)) {
      toast.error("No se puede guardar", { description: "RUT inválido." });
      return;
    }
    if (!draft.weapon_id || !draft.comuna_id || !draft.case_status_id) {
      toast.error("No se puede guardar", {
        description: "Arma, comuna y estado son obligatorios.",
      });
      return;
    }

    // ✅ parse lat/lng (vienen como string en draft)
    const latitude = parseNullableNumber(draft.latitude);
    const longitude = parseNullableNumber(draft.longitude);

    if (draft.latitude.trim() && latitude === null) {
      toast.error("Latitud inválida", { description: "Debe ser un número válido." });
      return;
    }
    if (draft.longitude.trim() && longitude === null) {
      toast.error("Longitud inválida", { description: "Debe ser un número válido." });
      return;
    }

    try {
      setSavingEdit(true);

      const isoDate = new Date(`${draft.date}T00:00:00.000Z`).toISOString();

      const updated = await updateHomicide(editingId, {
        ruc: draft.ruc.trim(),
        fullName: draft.full_name.trim(),
        rut: toDbRut(draft.rut.trim()),
        date: isoDate,
        weaponId: draft.weapon_id,
        comunaId: draft.comuna_id,
        caseStatusId: draft.case_status_id,
        address: draft.address.trim() ? draft.address.trim() : null,
        latitude,  // ✅ se envía a BBDD
        longitude, // ✅ se envía a BBDD
      });

      toast.success("Caso actualizado");

      if (updated) {
        setItems((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
      } else {
        setItems((prev) =>
          prev.map((x) =>
            x.id === editingId
              ? {
                  ...x,
                  ruc: draft.ruc.trim(),
                  full_name: draft.full_name.trim(),
                  rut: toDbRut(draft.rut.trim()),
                  date: isoDate,
                  weapon_id: draft.weapon_id,
                  comuna_id: draft.comuna_id,
                  case_status_id: draft.case_status_id,
                  address: draft.address.trim() ? draft.address.trim() : null,
                  latitude,
                  longitude,
                }
              : x
          )
        );
      }

      cancelEdit();
    } catch (e: any) {
      toast.error("No se pudo actualizar", { description: e?.message ?? "Error inesperado" });
    } finally {
      setSavingEdit(false);
    }
  }, [editingId, draft, cancelEdit]);

  const locateOnMap = useCallback(
    (id: string) => {
      const target = rows.find((x) => x.id === id);
      if (!target || typeof target.latitude !== "number" || typeof target.longitude !== "number") {
        toast.error("Este caso no tiene coordenadas para ubicar en el mapa.");
        return;
      }

      setFocusPoint(null);
      setFocusId(id);
      mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [rows]
  );

  // ✅ columnas estables
  const columns = useMemo(() => homicideColumns(), []);

  const tableMeta = useMemo<HomicideTableMeta>(() => {
    return {
      onDelete: requestDelete,
      onLocate: locateOnMap,

      editingId,
      draft,

      startEdit,
      cancelEdit,
      saveEdit,
      patchDraft,

      geocodeEditAddress,
      geocodingEdit,

      weapons: [...weapons].sort((a, b) => a.name.localeCompare(b.name)),
      comunas: [...comunas].sort((a, b) => a.name.localeCompare(b.name)),
      statuses: [...statuses].sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [
    requestDelete,
    locateOnMap,
    editingId,
    draft,
    startEdit,
    cancelEdit,
    saveEdit,
    patchDraft,
    geocodeEditAddress,
    geocodingEdit,
    weapons,
    comunas,
    statuses,
  ]);

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
        <DataTable columns={columns} data={rows} meta={tableMeta} />

        {savingEdit && (
          <p className="text-center text-sm text-muted-foreground">Guardando cambios...</p>
        )}
      </div>

      <div className="space-y-4" ref={mapSectionRef}>
        <h2 className="text-center text-xl font-semibold">Georreferenciación de Casos</h2>
        <HomicidesMap homicides={rows} focusId={focusId} focusPoint={focusPoint} />
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
