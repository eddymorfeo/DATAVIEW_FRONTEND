"use client";

import { useFormContext } from "react-hook-form";
import type { ProcedureFormValues } from "@/components/principal/schemas/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

const weaponFields: Array<{ name: keyof ProcedureFormValues; label: string }> = [
  { name: "pistolsUnits", label: "Pistolas" },
  { name: "revolverUnits", label: "Revólver" },
  { name: "homemadeGunUnits", label: "Arma Hechiza" },
  { name: "adaptedBlankGunUnits", label: "Arma a fogueo adaptada" },
  { name: "blankGunUnits", label: "Arma fogueo" },
  { name: "shotgunUnits", label: "Escopeta" },
  { name: "ammoUnits", label: "Municiones" },
  { name: "magazinesUnits", label: "Cargadores" },
  { name: "rifleUnits", label: "Rifle" },
  { name: "assaultRifleUnits", label: "Fusil" },
  { name: "carbineUnits", label: "Carabina" },
  { name: "airgunUnits", label: "Arma aire comprimido" },
  { name: "fantasyWeaponUnits", label: "Arma fantasía" },
  { name: "grenadeUnits", label: "Granada" },
  { name: "submachinegunUnits", label: "Subametralladora" },
  { name: "suppressorUnits", label: "Silenciadores" },
  { name: "antiTankShellUnits", label: "Carcasa antitanque" },
  { name: "tearGasBombUnits", label: "Bomba lacrimógena" },
  { name: "molotovUnits", label: "Molotov" },
  { name: "fireworksUnits", label: "Fuegos artificiales" },
];

export default function Step3WeaponsElements() {
  const { getValues, setValue, watch } = useFormContext<ProcedureFormValues>();

  // watch para re-render cuando cambian
  watch(weaponFields.map((w) => w.name));

  const inc = (name: keyof ProcedureFormValues) => {
    const current = Number(getValues(name) ?? 0);
    setValue(name, current + 1, { shouldDirty: true });
  };

  const dec = (name: keyof ProcedureFormValues) => {
    const current = Number(getValues(name) ?? 0);
    setValue(name, Math.max(0, current - 1), { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Armas y elementos</h2>
        <p className="text-sm text-muted-foreground">
          Usa los controles rápidos para registrar cantidades.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {weaponFields.map((w) => {
          const value = Number(getValues(w.name) ?? 0);

          return (
            <Card key={String(w.name)} className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="text-sm font-medium">{w.label}</div>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => dec(w.name)} className="h-9 px-3">
                    -
                  </Button>

                  <Input
                    type="number"
                    min={0}
                    value={Number.isFinite(value) ? value : 0}
                    onChange={(e) => setValue(w.name, e.target.value as any, { shouldDirty: true })}
                    className="h-9 text-center"
                  />

                  <Button type="button" variant="outline" onClick={() => inc(w.name)} className="h-9 px-3">
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
