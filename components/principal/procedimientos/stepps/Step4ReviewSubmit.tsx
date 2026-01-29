"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { ProcedureFormValues } from "@/components/principal/schemas/schema";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  onEditSection: (id: "step-1" | "step-2" | "step-3" | "step-4") => void;
};

export default function Step4ReviewSubmit({ onEditSection }: Props) {
  const { getValues } = useFormContext<ProcedureFormValues>();
  const values = getValues();

  const weaponsTotal = useMemo(() => {
    const keys = Object.keys(values).filter((k) => k.endsWith("Units")) as Array<keyof ProcedureFormValues>;
    return keys.reduce((acc, key) => acc + Number(values[key] ?? 0), 0);
  }, [values]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Revisión</h2>
        <p className="text-sm text-muted-foreground">
          Verifica la información antes de enviar.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Identificación</div>
              <Button type="button" variant="outline" size="sm" onClick={() => onEditSection("step-1")}>
                Editar
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm">
              <Row label="RUC" value={values.ruc} />
              <Row label="N° Parte" value={values.policeReportNumber} />
              <Row label="Procedimiento" value={values.procedureType} />
              <Row label="Fecha Formalización" value={values.formalizationDate ?? "-"} />
              <Row label="Fecha Parte" value={values.policeReportDate ?? "-"} />
              <Row label="Comisaría" value={values.policeStation} />
              <Row label="Comuna" value={values.comuna} />
              <Row label="Delito" value={values.crime} />
              <Row label="Fiscal" value={values.prosecutor} />
              <Row label="Detenidos" value={String(values.detaineesCount ?? 0)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Drogas e Incautaciones</div>
              <Button type="button" variant="outline" size="sm" onClick={() => onEditSection("step-2")}>
                Editar
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm">
              <Row label="Clorhidrato (g)" value={fmtNum(values.cocaineGrams)} />
              <Row label="Marihuana (g)" value={fmtNum(values.marijuanaGrams)} />
              <Row label="Pasta base (g)" value={fmtNum(values.cocaineBaseGrams)} />
              <Row label="Plantas (u)" value={fmtNum(values.marijuanaPlantsUnits)} />
              <Row label="Medicamento" value={values.medicineType ?? "-"} />
              <Row label="Peso med (g)" value={fmtNum(values.medicineWeightGrams)} />
              <Row label="Otras drogas" value={values.otherDrugType ?? "-"} />
              <Row label="Peso otras (g)" value={fmtNum(values.otherDrugWeightGrams)} />
              <Row label="Vehículos (u)" value={fmtNum(values.vehiclesUnits)} />
              <Row label="Dinero" value={fmtMoney(values.moneyAmount)} />
              <Row label="Dinero extranjero" value={fmtMoney(values.foreignMoneyAmount)} />
              <Row label="Inmueble incautado" value={values.seizedProperty ? "Sí" : "No"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Armas y elementos</div>
              <Button type="button" variant="outline" size="sm" onClick={() => onEditSection("step-3")}>
                Editar
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Total items (unidades): <span className="text-foreground font-medium">{weaponsTotal}</span>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              (Resumen corto) Si quieres, aquí también podemos listar solo los ítems con valor &gt; 0.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        Al presionar <b>Enviar</b>, se guardará el registro completo.
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}

function fmtNum(v: unknown) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "0";
  return String(n);
}

function fmtMoney(v: unknown) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("es-CL");
}
