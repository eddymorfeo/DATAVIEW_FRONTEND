"use client";

import { useFormContext } from "react-hook-form";
import type { ProcedureFormValues } from "@/components/principal/schemas/schema";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

export default function Step2DrugsSeizures() {
  const { control, watch } = useFormContext<ProcedureFormValues>();
  const seizedProperty = watch("seizedProperty");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Drogas e Incautaciones</h2>
        <p className="text-sm text-muted-foreground">
          Registra cantidades, montos y elementos incautados.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="cocaineGrams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clorhidrato (gramos)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.001" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="marijuanaGrams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marihuana (gramos)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.001" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cocaineBaseGrams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pasta Base (gramos)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.001" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="marijuanaPlantsUnits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plantas de Marihuana (unidad)</FormLabel>
              <FormControl>
                <Input type="number" min={0} value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="medicineType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Medicamento</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Clonazepam..." value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="medicineWeightGrams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso medicamento (gramos)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.001" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="otherDrugType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Otras drogas (tipo)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ketamina..." value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="otherDrugWeightGrams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Otras drogas (peso gramos)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.001" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="vehiclesUnits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehículos (unidad)</FormLabel>
              <FormControl>
                <Input type="number" min={0} value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="moneyAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dinero</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="foreignMoneyAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dinero extranjero</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="seizedProperty"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Inmueble incautado</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Marca si existe incautación de inmueble.
                </p>
              </div>
              <FormControl>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {seizedProperty ? (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          (Opcional) Aquí podrías agregar campos de detalle del inmueble si luego lo necesitas.
        </div>
      ) : null}
    </div>
  );
}
