"use client";

import { useState } from "react";
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
} from "@/components/ui/dialog";

import { analistas } from "@/lib/focos/analistas";
import { comunas } from "@/lib/focos/comunas";
import { fiscales } from "@/lib/focos/fiscales";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 7 }, (_, i) => `${currentYear - 5 + i}`);

type Errors = {
  numero?: string;
  anio?: string;
  titulo?: string;
  descripcion?: string;
  comuna?: string;
  analista?: string;
  fiscal?: string;
};

export function AddFocosForm() {
  const [numero, setNumero] = useState("");
  const [anio, setAnio] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [comuna, setComuna] = useState("");
  const [analista, setAnalista] = useState("");
  const [fiscal, setFiscal] = useState("");

  const [errors, setErrors] = useState<Errors>({});

  // ===== Handlers reactivos =====

  function handleNumeroChange(value: string) {
    const numericValue = value.replace(/\D/g, "");
    setNumero(numericValue);

    setErrors((e) => ({
      ...e,
      numero: numericValue ? undefined : "No has ingresado un número de foco válido.",
    }));
  }

  function handleAnioChange(value: string) {
    setAnio(value);
    setErrors((e) => ({ ...e, anio: undefined }));
  }

  function handleTituloChange(value: string) {
    setTitulo(value);
    setErrors((e) => ({ ...e, titulo: value ? undefined : e.titulo }));
  }

  function handleDescripcionChange(value: string) {
    setDescripcion(value);
    setErrors((e) => ({ ...e, descripcion: value ? undefined : e.descripcion }));
  }

  function handleSelectChange(
    setter: (v: string) => void,
    field: keyof Errors
  ) {
    return (value: string) => {
      setter(value);
      setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  // ===== Guardar =====
  function handleGuardarFoco() {
    const newErrors: Errors = {};

    if (!numero) newErrors.numero = "No has ingresado un número de foco válido.";
    if (!anio) newErrors.anio = "Debes seleccionar un año.";
    if (!titulo) newErrors.titulo = "El título del foco es obligatorio.";
    if (!descripcion) newErrors.descripcion = "La descripción es obligatoria.";
    if (!comuna) newErrors.comuna = "Debes seleccionar una comuna.";
    if (!analista) newErrors.analista = "Debes seleccionar un analista.";
    if (!fiscal) newErrors.fiscal = "Debes seleccionar un fiscal.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Formulario incompleto", {
        description: "Revisa los campos marcados en rojo.",
      });
      return;
    }

    const nuevoFoco: any = {
      numeroFoco: numero,
      anioFoco: anio,
      texto: titulo,
      descripcion,
      fecha: new Date().toLocaleString(),
      completada: false,
      estadoFoco: "Vigente",
      analista,
      asignadoA: fiscal,
      comuna,
      ordenInvestigar: false,
      instruccionParticular: false,
      diligencias: false,
      reunionPolicial: false,
      informes: false,
      procedimientos: false,
    };

    const focos = JSON.parse(localStorage.getItem("focos") || "[]");
    focos.unshift(nuevoFoco);
    localStorage.setItem("focos", JSON.stringify(focos));

    toast.success("Foco creado correctamente");

    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Añadir Nuevo Foco</DialogTitle>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Número / Año */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Número</Label>
            <Input
              inputMode="numeric"
              value={numero}
              onChange={(e) => handleNumeroChange(e.target.value)}
            />
            {errors.numero && <p className="text-sm text-red-500">{errors.numero}</p>}
          </div>

          <div className="space-y-1">
            <Label>Año</Label>
            <Select value={anio} onValueChange={handleAnioChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecciona año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.anio && <p className="text-sm text-red-500">{errors.anio}</p>}
          </div>
        </div>

        {/* Título */}
        <div className="space-y-1">
          <Label>Nombre / Título del Foco</Label>
          <Input value={titulo} onChange={(e) => handleTituloChange(e.target.value)} />
          {errors.titulo && <p className="text-sm text-red-500">{errors.titulo}</p>}
        </div>

        {/* Descripción */}
        <div className="space-y-1">
          <Label>Breve descripción del foco</Label>
          <Textarea
            rows={4}
            value={descripcion}
            onChange={(e) => handleDescripcionChange(e.target.value)}
          />
          {errors.descripcion && (
            <p className="text-sm text-red-500">{errors.descripcion}</p>
          )}
        </div>

        {/* Comuna / Analista */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Comuna</Label>
            <Select value={comuna} onValueChange={handleSelectChange(setComuna, "comuna")}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecciona comuna" />
              </SelectTrigger>
              <SelectContent>
                {comunas.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.comuna && <p className="text-sm text-red-500">{errors.comuna}</p>}
          </div>

          <div className="space-y-1">
            <Label>Analista</Label>
            <Select value={analista} onValueChange={handleSelectChange(setAnalista, "analista")}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecciona analista" />
              </SelectTrigger>
              <SelectContent>
                {analistas.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.analista && <p className="text-sm text-red-500">{errors.analista}</p>}
          </div>
        </div>

        {/* Fiscal */}
        <div className="space-y-1">
          <Label>Fiscal Asignado</Label>
          <Select value={fiscal} onValueChange={handleSelectChange(setFiscal, "fiscal")}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecciona fiscal" />
            </SelectTrigger>
            <SelectContent>
              {fiscales.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fiscal && <p className="text-sm text-red-500">{errors.fiscal}</p>}
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-3">
        <Button variant="secondary">Cancelar</Button>
        <Button onClick={handleGuardarFoco} className="bg-blue-600 text-white">
          Guardar Foco
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
