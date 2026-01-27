"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

import type {
  CaseStatusItem,
  ComunaItem,
  Homicide,
  WeaponItem,
} from "@/lib/focos/types";
import { createHomicide } from "@/lib/homicidios/homicidios-service";

const LocationPickerMap = dynamic(
  () => import("./maps/location-picker-map").then((m) => m.LocationPickerMap),
  { ssr: false }
);

/** -------------------------
 *  ✅ RUT helpers (Chile)
 *  - UI: 12.345.678-5
 *  - BBDD: 12345678-5
 *  ------------------------- */
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

function toDbRut(value: string): string {
  const rut = normalizeRut(value);
  if (rut.length < 2) return rut;
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  return `${body}-${dv}`;
}

/** -------------------------
 *  Maps helpers
 *  ------------------------- */
function parseCoords(value: string): { lat: number; lng: number } | null {
  const raw = value.trim();
  if (!raw) return null;

  const match = raw.match(/^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/);
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[3]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;

  return { lat, lng };
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

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.display_name ?? null;
}

type Props = {
  open?: boolean;

  weapons: WeaponItem[];
  comunas: ComunaItem[];
  statuses: CaseStatusItem[];
  onCreated: (h: Homicide) => void;
  onCancel: () => void;
};

type Errors = {
  ruc?: string;
  date?: string;
  fullName?: string;
  rut?: string;
  address?: string;
  coords?: string;
  weaponId?: string;
  comunaId?: string;
  caseStatusId?: string;
};

export function AddHomicideForm({
  open,
  weapons,
  comunas,
  statuses,
  onCreated,
  onCancel,
}: Props) {
  const [saving, setSaving] = useState(false);

  const [ruc, setRuc] = useState("");
  const [date, setDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [rut, setRut] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState("");

  const [weaponId, setWeaponId] = useState("");
  const [comunaId, setComunaId] = useState("");
  const [caseStatusId, setCaseStatusId] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const weaponOptions = useMemo(
    () => [...weapons].sort((a, b) => a.name.localeCompare(b.name)),
    [weapons]
  );
  const comunaOptions = useMemo(
    () => [...comunas].sort((a, b) => a.name.localeCompare(b.name)),
    [comunas]
  );
  const statusOptions = useMemo(
    () => [...statuses].sort((a, b) => a.name.localeCompare(b.name)),
    [statuses]
  );

  function clearFieldError(field: keyof Errors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function resetForm() {
    setSaving(false);

    setRuc("");
    setDate("");
    setFullName("");
    setRut("");
    setAddress("");
    setCoords("");

    setWeaponId("");
    setComunaId("");
    setCaseStatusId("");

    setErrors({});
    setMarker(null);
  }

  useEffect(() => {
    if (open) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function validate(): Errors {
    const newErrors: Errors = {};

    if (!ruc.trim()) newErrors.ruc = "RUC es obligatorio.";
    if (!date.trim()) newErrors.date = "Fecha del hecho es obligatoria.";
    if (!fullName.trim())
      newErrors.fullName = "Nombre de la víctima es obligatorio.";

    if (!rut.trim()) {
      newErrors.rut = "RUT de la víctima es obligatorio.";
    } else if (!isValidRut(rut)) {
      newErrors.rut = "RUT inválido. Verifica el dígito verificador (DV).";
    }

    if (!weaponId) newErrors.weaponId = "Debes seleccionar un tipo de arma.";
    if (!comunaId) newErrors.comunaId = "Debes seleccionar una comuna.";
    if (!caseStatusId)
      newErrors.caseStatusId = "Debes seleccionar un estado del caso.";

    if (coords.trim() && !parseCoords(coords)) {
      newErrors.coords =
        "Coordenadas inválidas. Formato: lat, lng (ej: -33.456604, -70.661507)";
    }

    return newErrors;
  }

  async function handleBuscarDireccion() {
    try {
      if (!address.trim()) {
        setErrors((e) => ({
          ...e,
          address: "Ingresa una dirección para buscar.",
        }));
        toast.error("Formulario incompleto", {
          description: "Revisa los campos marcados en rojo.",
        });
        return;
      }

      clearFieldError("address");

      const found = await geocodeAddress(address);
      if (!found) {
        setErrors((e) => ({
          ...e,
          address: "Dirección no encontrada. Verifica que sea válida.",
        }));
        toast.error("Dirección no encontrada", {
          description: "Verifica que sea válida (ej: Merced 2558, Santiago).",
        });
        return;
      }

      // ✅ Esto ya pone el marker. Ahora el mapa se moverá solo (flyTo) en el componente del mapa
      setMarker({ lat: found.lat, lng: found.lng });
      setCoords(`${found.lat.toFixed(6)}, ${found.lng.toFixed(6)}`);
      setAddress(found.label);

      clearFieldError("coords");
      toast.success("Dirección ubicada en el mapa");
    } catch (e: any) {
      toast.error("No se pudo buscar la dirección", {
        description: e?.message ?? "Error inesperado",
      });
    }
  }

  async function handleUbicarCoordenadas() {
    const parsed = parseCoords(coords);

    if (!coords.trim()) {
      setErrors((e) => ({ ...e, coords: "Ingresa coordenadas para ubicar." }));
      toast.error("Formulario incompleto", {
        description: "Revisa los campos marcados en rojo.",
      });
      return;
    }

    if (!parsed) {
      setErrors((e) => ({
        ...e,
        coords:
          "Coordenadas inválidas. Formato: lat, lng (ej: -33.456604, -70.661507)",
      }));
      toast.error("Formulario incompleto", {
        description: "Revisa los campos marcados en rojo.",
      });
      return;
    }

    clearFieldError("coords");

    // ✅ Esto ya pone el marker. Ahora el mapa se moverá solo (flyTo) en el componente del mapa
    setMarker(parsed);

    const label = await reverseGeocode(parsed.lat, parsed.lng);
    if (label) {
      setAddress(label);
      clearFieldError("address");
    }

    toast.success("Coordenadas ubicadas en el mapa");
  }

  async function handleGuardar() {
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Formulario incompleto", {
        description: "Revisa los campos marcados en rojo.",
      });
      return;
    }

    const parsed = coords.trim() ? parseCoords(coords) : null;
    const isoDate = new Date(`${date}T00:00:00.000Z`).toISOString();

    try {
      setSaving(true);

      const created = await createHomicide({
        ruc: ruc.trim(),
        date: isoDate,
        fullName: fullName.trim() ? fullName.trim() : null,
        rut: rut.trim() ? toDbRut(rut.trim()) : null,
        address: address.trim() ? address.trim() : null,
        latitude: parsed?.lat ?? null,
        longitude: parsed?.lng ?? null,
        weaponId,
        comunaId,
        caseStatusId,
        isActive: true,
      });

      onCreated(created);
      resetForm();
    } catch (e: any) {
      toast.error("No se pudo guardar el caso", {
        description: e?.message ?? "Error inesperado",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleCancelar() {
    resetForm();
    onCancel();
  }

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Añadir Nuevo Caso de Homicidio</DialogTitle>
        <DialogDescription>
          Completa los datos y ubica la dirección/ coordenadas en el mapa.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 py-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>RUC</Label>
            <Input
              value={ruc}
              onChange={(e) => {
                setRuc(e.target.value);
                clearFieldError("ruc");
              }}
              disabled={saving}
            />
            {errors.ruc && <p className="text-sm text-red-500">{errors.ruc}</p>}
          </div>

          <div className="space-y-1">
            <Label>Fecha del Hecho</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                clearFieldError("date");
              }}
              disabled={saving}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          <div className="space-y-1">
            <Label>Víctima</Label>
            <Input
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clearFieldError("fullName");
              }}
              disabled={saving}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>RUT Víctima</Label>
            <Input
              value={rut}
              onChange={(e) => {
                setRut(e.target.value);
                clearFieldError("rut");
              }}
              onBlur={() => {
                if (rut.trim()) setRut(formatRutUi(rut.trim()));
              }}
              disabled={saving}
              placeholder="12.345.678-5"
            />
            {errors.rut && <p className="text-sm text-red-500">{errors.rut}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-1">
            <Label>Dirección</Label>
            <Input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                clearFieldError("address");
              }}
              disabled={saving}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>
          <Button
            onClick={handleBuscarDireccion}
            disabled={saving}
            className="h-10 bg-blue-600 text-white"
          >
            Buscar
          </Button>
        </div>

        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-1">
            <Label>
              Coordenadas (Lat, Lng){" "}
              <span className="text-muted-foreground text-xs italic">
                (Recomendado)
              </span>
            </Label>
            <Input
              value={coords}
              onChange={(e) => {
                setCoords(e.target.value);
                clearFieldError("coords");
              }}
              disabled={saving}
              placeholder="-33.456604, -70.661507"
            />
            {errors.coords && (
              <p className="text-sm text-red-500">{errors.coords}</p>
            )}
          </div>
          <Button
            onClick={handleUbicarCoordenadas}
            disabled={saving}
            className="h-10 bg-blue-600 text-white"
          >
            Ubicar
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Ubicación en Mapa</Label>
          <div className="overflow-hidden rounded-xl border">
            <LocationPickerMap
              marker={marker}
              onPick={async (p) => {
                setMarker(p);
                setCoords(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`);
                clearFieldError("coords");

                const label = await reverseGeocode(p.lat, p.lng);
                if (label) {
                  setAddress(label);
                  clearFieldError("address");
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Puedes mover/zoom y hacer click para fijar el punto. (También puedes
            arrastrar el marcador)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Tipo de Arma</Label>
            <Select
              value={weaponId}
              onValueChange={(v) => {
                setWeaponId(v);
                clearFieldError("weaponId");
              }}
              disabled={saving}
            >
              <SelectTrigger className="h-10 w-50">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {weaponOptions.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.weaponId && (
              <p className="text-sm text-red-500">{errors.weaponId}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Comuna</Label>
            <Select
              value={comunaId}
              onValueChange={(v) => {
                setComunaId(v);
                clearFieldError("comunaId");
              }}
              disabled={saving}
            >
              <SelectTrigger className="h-10 w-50">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {comunaOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.comunaId && (
              <p className="text-sm text-red-500">{errors.comunaId}</p>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label>Estado del Caso</Label>
            <Select
              value={caseStatusId}
              onValueChange={(v) => {
                setCaseStatusId(v);
                clearFieldError("caseStatusId");
              }}
              disabled={saving}
            >
              <SelectTrigger className="h-10 w-50">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.caseStatusId && (
              <p className="text-sm text-red-500">{errors.caseStatusId}</p>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="secondary" onClick={handleCancelar} disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          className="bg-blue-600 text-white"
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar Caso"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
