"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { CaseStatusItem, ComunaItem, Homicide, WeaponItem } from "@/lib/focos/types";
import { createHomicide } from "@/lib/homicidios/homicidios-service";

const LocationPickerMap = dynamic(() => import("./maps/location-picker-map").then(m => m.LocationPickerMap), {
  ssr: false,
});

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

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const q = address.trim();
  if (!q) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&accept-language=es`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
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
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.display_name ?? null;
}

type Props = {
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

export function AddHomicideForm({ weapons, comunas, statuses, onCreated, onCancel }: Props) {
  const [saving, setSaving] = useState(false);

  // campos
  const [ruc, setRuc] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd (UI)
  const [fullName, setFullName] = useState("");
  const [rut, setRut] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(""); // "lat, lng"
  const [errors, setErrors] = useState<Errors>({});
  const [weaponId, setWeaponId] = useState("");
  const [comunaId, setComunaId] = useState("");
  const [caseStatusId, setCaseStatusId] = useState("");

  // mapa
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  const weaponOptions = useMemo(() => [...weapons].sort((a, b) => a.name.localeCompare(b.name)), [weapons]);
  const comunaOptions = useMemo(() => [...comunas].sort((a, b) => a.name.localeCompare(b.name)), [comunas]);
  const statusOptions = useMemo(() => [...statuses].sort((a, b) => a.name.localeCompare(b.name)), [statuses]);

  async function handleBuscarDireccion() {
    try {
      if (!address.trim()) {
        toast.error("Ingresa una dirección");
        return;
      }

      const found = await geocodeAddress(address);
      if (!found) {
        toast.error("Dirección no encontrada", { description: "Verifica que sea válida (ej: Merced 2558, Santiago)." });
        return;
      }

      setMarker({ lat: found.lat, lng: found.lng });
      setCoords(`${found.lat.toFixed(6)}, ${found.lng.toFixed(6)}`);
      setAddress(found.label);
      toast.success("Dirección ubicada en el mapa");
    } catch (e: any) {
      toast.error("No se pudo buscar la dirección", { description: e?.message ?? "Error inesperado" });
    }
  }

  async function handleUbicarCoordenadas() {
    const parsed = parseCoords(coords);
    if (!parsed) {
      toast.error("Coordenadas inválidas", { description: "Formato esperado: lat, lng (ej: -33.456604, -70.661507)" });
      return;
    }

    setMarker(parsed);

    // opcional: completar dirección automáticamente
    const label = await reverseGeocode(parsed.lat, parsed.lng);
    if (label) setAddress(label);

    toast.success("Coordenadas ubicadas en el mapa");
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!ruc.trim()) errors.push("RUC es obligatorio.");
    if (!date.trim()) errors.push("Fecha del hecho es obligatoria.");
    if (!fullName.trim()) errors.push("Nombre de la víctima es obligatorio.");
    if (!rut.trim()) errors.push("Rut es obligatorio.");
    if (!weaponId) errors.push("Tipo de arma es obligatorio.");
    if (!comunaId) errors.push("Comuna es obligatoria.");
    if (!caseStatusId) errors.push("Estado del caso es obligatorio.");

    // si hay coords, deben ser válidas
    if (coords.trim() && !parseCoords(coords)) errors.push("Coordenadas inválidas.");

    return errors;
  }

  async function handleGuardar() {
    const errs = validate();
    if (errs.length) {
      toast.error("Formulario incompleto", { description: errs[0] });
      return;
    }

    const parsed = coords.trim() ? parseCoords(coords) : null;

    // date viene como yyyy-mm-dd -> ISO
    const isoDate = new Date(`${date}T00:00:00.000Z`).toISOString();

    try {
      setSaving(true);

      const created = await createHomicide({
        ruc: ruc.trim(),
        date: isoDate,
        fullName: fullName.trim() ? fullName.trim() : null,
        rut: rut.trim() ? rut.trim() : null,
        address: address.trim() ? address.trim() : null,
        latitude: parsed?.lat ?? null,
        longitude: parsed?.lng ?? null,
        weaponId,
        comunaId,
        caseStatusId,
        isActive: true,
      });

      onCreated(created);
    } catch (e: any) {
      toast.error("No se pudo guardar el caso", { description: e?.message ?? "Error inesperado" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Añadir Nuevo Caso de Homicidio</DialogTitle>
        <DialogDescription>Completa los datos y ubica la dirección/ coordenadas en el mapa.</DialogDescription>
      </DialogHeader>

      <div className="space-y-5 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>RUC</Label>
            <Input value={ruc} onChange={(e) => setRuc(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1">
            <Label>Fecha del Hecho</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1">
            <Label>Víctima</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1">
            <Label>RUT Víctima</Label>
            <Input value={rut} onChange={(e) => setRut(e.target.value)} disabled={saving} />
          </div>
        </div>

        {/* Dirección + Buscar */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1">
            <Label>Dirección</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} disabled={saving} />
          </div>
          <Button onClick={handleBuscarDireccion} disabled={saving} className="h-10">
            Buscar
          </Button>
        </div>

        {/* Coordenadas + Ubicar */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1">
            <Label>Coordenadas (Lat, Lng) <span className="text-muted-foreground italic text-xs">(Recomendado)</span></Label>
            <Input value={coords} onChange={(e) => setCoords(e.target.value)} disabled={saving} placeholder="-33.456604, -70.661507" />
          </div>
          <Button onClick={handleUbicarCoordenadas} disabled={saving} className="h-10">
            Ubicar
          </Button>
        </div>

        {/* Mapa pequeño */}
        <div className="space-y-2">
          <Label>Ubicación en Mapa</Label>
          <div className="rounded-xl border overflow-hidden">
            <LocationPickerMap
              marker={marker}
              onPick={async (p) => {
                setMarker(p);
                setCoords(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`);
                const label = await reverseGeocode(p.lat, p.lng);
                if (label) setAddress(label);
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Puedes mover/zoom y hacer click para fijar el punto. (También puedes arrastrar el marcador)
          </p>
        </div>

        {/* Selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Tipo de Arma</Label>
            <Select value={weaponId} onValueChange={setWeaponId} disabled={saving}>
              <SelectTrigger className="h-10">
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
          </div>

          <div className="space-y-1">
            <Label>Comuna</Label>
            <Select value={comunaId} onValueChange={setComunaId} disabled={saving}>
              <SelectTrigger className="h-10">
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
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label>Estado del Caso</Label>
            <Select value={caseStatusId} onValueChange={setCaseStatusId} disabled={saving}>
              <SelectTrigger className="h-10">
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
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleGuardar} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Caso"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
