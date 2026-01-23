"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Foco } from "@/lib/focos/types";
import { createFoco } from "@/lib/focos/focos-service";
import {
  fetchAnalistas,
  fetchComunas,
  fetchFiscales,
  type ComunaItem,
  type UserItem,
} from "@/lib/focos/lookups-service";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 7 }, (_, i) => `${currentYear - 5 + i}`);
const asStr = (v: unknown) => String(v ?? "");

const DEFAULT_STATUS_ID = "917265b4-2688-483b-8c19-c4412e385b0d";

type Errors = {
  numero?: string;
  anio?: string;
  titulo?: string;
  descripcion?: string;
  comuna?: string;
  analista?: string;
  fiscal?: string;
  createdBy?: string;
};

type Props = {
  onCreated: (foco: Foco) => void;
  onCancel: () => void;
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getLoggedUserId(): string | null {
  const direct =
    localStorage.getItem("userId") ||
    localStorage.getItem("user_id") ||
    localStorage.getItem("id");

  if (direct) return direct;

  const userObj =
    safeJsonParse<{ id?: string }>(localStorage.getItem("user")) ||
    safeJsonParse<{ id?: string }>(localStorage.getItem("auth_user")) ||
    safeJsonParse<{ id?: string }>(localStorage.getItem("currentUser"));

  return userObj?.id ?? null;
}

export function AddFocosForm({ onCreated, onCancel }: Props) {

  const [numero, setNumero] = useState("");
  const [anio, setAnio] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [comunaId, setComunaId] = useState("");
  const [analistaId, setAnalistaId] = useState("");
  const [fiscalId, setFiscalId] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [comunasDb, setComunasDb] = useState<ComunaItem[]>([]);
  const [analistasDb, setAnalistasDb] = useState<UserItem[]>([]);
  const [fiscalesDb, setFiscalesDb] = useState<UserItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingLookups(true);

        const [comunas, analistas, fiscales] = await Promise.all([
          fetchComunas(),
          fetchAnalistas(),
          fetchFiscales(),
        ]);

        setComunasDb((comunas ?? []).filter((c) => c.is_active));
        setAnalistasDb((analistas ?? []).filter((u) => u.is_active));
        setFiscalesDb((fiscales ?? []).filter((u) => u.is_active));
      } catch (e: any) {
        toast.error("No se pudieron cargar los select", {
          description: e?.message ?? "Error inesperado",
        });
      } finally {
        setLoadingLookups(false);
      }
    })();
  }, []);

  const isDisabled = saving || loadingLookups;

  const comunaOptions = useMemo(
    () => [...comunasDb].sort((a, b) => a.name.localeCompare(b.name)),
    [comunasDb]
  );

  const analistaOptions = useMemo(
    () => [...analistasDb].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [analistasDb]
  );

  const fiscalOptions = useMemo(
    () => [...fiscalesDb].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [fiscalesDb]
  );

  function handleNumeroChange(value: string) {
    const numericValue = value.replace(/\D/g, "");
    setNumero(numericValue);
    setErrors((e) => ({ ...e, numero: numericValue ? undefined : "Ingresa un número válido." }));
  }

  function handleSelectChange(setter: (v: string) => void, field: keyof Errors) {
    return (value: string) => {
      setter(value);
      setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  function validate(): Errors {
    const newErrors: Errors = {};

    if (!numero) newErrors.numero = "No has ingresado un número de foco válido.";
    if (!anio) newErrors.anio = "Debes seleccionar un año.";
    if (!titulo) newErrors.titulo = "El título del foco es obligatorio.";
    if (!descripcion) newErrors.descripcion = "La descripción es obligatoria.";
    if (!comunaId) newErrors.comuna = "Debes seleccionar una comuna.";
    if (!analistaId) newErrors.analista = "Debes seleccionar un analista.";
    if (!fiscalId) newErrors.fiscal = "Debes seleccionar un fiscal.";

    const createdBy = getLoggedUserId();
    if (!createdBy) newErrors.createdBy = "No se pudo determinar el usuario logueado (createdBy).";

    return newErrors;
  }

  function resetForm() {
    setNumero("");
    setAnio("");
    setTitulo("");
    setDescripcion("");
    setComunaId("");
    setAnalistaId("");
    setFiscalId("");
    setErrors({});
  }

  async function handleGuardarFoco() {
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Formulario incompleto", { description: "Revisa los campos marcados en rojo." });
      return;
    }

    const createdBy = getLoggedUserId()!;

    try {
      setSaving(true);

      const payload = {
        focoNumber: Number(numero),
        focoYear: Number(anio),
        title: titulo,
        description: descripcion,
        comunaId,
        statusId: DEFAULT_STATUS_ID,
        analystId: analistaId,
        assignedToId: fiscalId,
        isComplete: false,
        ordenInvestigar: false,
        instruccionParticular: false,
        diligencias: false,
        reunionPolicial: false,
        informes: false,
        procedimientos: false,
        createdBy,
      };
      console.log("[POST /focos payload]", payload);

      const created = await createFoco(payload);

      toast.success("Foco creado correctamente");
      onCreated(created);
      resetForm();
    } catch (e: any) {
      toast.error("No se pudo crear el foco", {
        description: e?.message ?? "Error inesperado",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Añadir Nuevo Foco</DialogTitle>
        <DialogDescription>Completa los datos para crear un foco nuevo.</DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Número</Label>
            <Input
              inputMode="numeric"
              value={numero}
              onChange={(e) => handleNumeroChange(e.target.value)}
              disabled={isDisabled}
            />
            {errors.numero && <p className="text-sm text-red-500">{errors.numero}</p>}
          </div>

          <div className="space-y-1">
            <Label>Año</Label>
            <Select value={anio} onValueChange={(v) => { setAnio(v); setErrors((e)=>({...e, anio: undefined})) }} disabled={isDisabled}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecciona año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={asStr(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.anio && <p className="text-sm text-red-500">{errors.anio}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Nombre / Título del Foco</Label>
          <Input
            value={titulo}
            onChange={(e) => { setTitulo(e.target.value); setErrors((er)=>({...er, titulo: undefined})) }}
            disabled={isDisabled}
          />
          {errors.titulo && <p className="text-sm text-red-500">{errors.titulo}</p>}
        </div>

        <div className="space-y-1">
          <Label>Breve descripción del foco</Label>
          <Textarea
            rows={4}
            value={descripcion}
            onChange={(e) => { setDescripcion(e.target.value); setErrors((er)=>({...er, descripcion: undefined})) }}
            disabled={isDisabled}
          />
          {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Comuna</Label>
            <Select
              value={comunaId}
              onValueChange={handleSelectChange(setComunaId, "comuna")}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={loadingLookups ? "Cargando..." : "Selecciona comuna"} />
              </SelectTrigger>
              <SelectContent>
                {comunaOptions.map((c) => (                  
                  <SelectItem key={c.id} value={asStr(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.comuna && <p className="text-sm text-red-500">{errors.comuna}</p>}
          </div>

          <div className="space-y-1">
            <Label>Analista</Label>
            <Select
              value={analistaId}
              onValueChange={handleSelectChange(setAnalistaId, "analista")}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={loadingLookups ? "Cargando..." : "Selecciona analista"} />
              </SelectTrigger>
              <SelectContent>
                {analistaOptions.map((a) => (
                  <SelectItem key={a.id} value={asStr(a.id)}>
                    {a.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.analista && <p className="text-sm text-red-500">{errors.analista}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Fiscal Asignado</Label>
          <Select
            value={fiscalId}
            onValueChange={handleSelectChange(setFiscalId, "fiscal")}
            disabled={isDisabled}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder={loadingLookups ? "Cargando..." : "Selecciona fiscal"} />
            </SelectTrigger>
            <SelectContent>
              {fiscalOptions.map((f) => (
                <SelectItem key={f.id} value={asStr(f.id)}>
                  {f.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fiscal && <p className="text-sm text-red-500">{errors.fiscal}</p>}
        </div>

        {errors.createdBy && (
          <p className="text-sm text-red-500">{errors.createdBy}</p>
        )}
      </div>

      <DialogFooter className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>

        <Button onClick={handleGuardarFoco} className="bg-blue-600 text-white" disabled={isDisabled}>
          {saving ? "Guardando..." : "Guardar Foco"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
