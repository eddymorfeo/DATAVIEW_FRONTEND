"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type { ProcedureFormValues } from "@/components/principal/schemas/schema";

export default function Step1CaseIdentification() {
  const { control, watch, setValue } = useFormContext<ProcedureFormValues>();
  const procedureType = watch("procedureType");

  // Ejemplo inteligente: si NO_FORMALIZADA, limpiamos formalizationDate y detaineesCount
  React.useEffect(() => {
    if (procedureType === "NO_FORMALIZADA") {
      setValue("formalizationDate", null);
      setValue("detaineesCount", 0);
    }
  }, [procedureType, setValue]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Identificación del caso</h2>
        <p className="text-sm text-muted-foreground">
          Completa los datos principales del procedimiento.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="ruc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUC</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 2500XXXXXX-0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="policeReportNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>N° de Parte</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="procedureType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Procedimiento</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROPIO">PROCEDIMIENTO PROPIO</SelectItem>
                    <SelectItem value="FLAGRANCIA">FLAGRANCIA</SelectItem>
                    <SelectItem value="NO_FORMALIZADA">NO FORMALIZADA</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="formalizationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Formalización</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  disabled={procedureType === "NO_FORMALIZADA"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="policeReportDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha del Parte</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="policeStation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comisaría</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 3ra Comisaría..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="comuna"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comuna</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Santiago" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="crime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delito</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Tráfico..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="prosecutor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fiscal</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del fiscal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="detaineesCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detenidos (solo formalizados)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={procedureType === "NO_FORMALIZADA"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
