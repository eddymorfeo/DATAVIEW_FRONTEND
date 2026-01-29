import { z } from "zod";

const num = () =>
  z
    .preprocess((value) => {
      if (value === "" || value === null || value === undefined) return null;

      const n = typeof value === "string" ? Number(value) : Number(value);
      return Number.isFinite(n) ? n : value;
    }, z.number().min(0).nullable())
    .optional();

const dateStr = () =>
  z
    .preprocess((value) => {
      if (value === "" || value === null || value === undefined) return null;
      return value;
    }, z.string().nullable())
    .optional();

export const procedureFormSchema = z.object({
  // Step 1
  ruc: z.string().min(1, "RUC es requerido"),
  policeReportNumber: z.string().min(1, "N° de Parte es requerido"),
  procedureType: z.enum(["PROPIO", "FLAGRANCIA", "NO_FORMALIZADA"]),
  formalizationDate: dateStr(),
  policeReportDate: dateStr(),
  policeStation: z.string().min(1, "Comisaría es requerida"),
  comuna: z.string().min(1, "Comuna es requerida"),
  crime: z.string().min(1, "Delito es requerido"),
  prosecutor: z.string().min(1, "Fiscal es requerido"),
  detaineesCount: num(),

  // Step 2
  cocaineGrams: num(),
  marijuanaGrams: num(),
  cocaineBaseGrams: num(),
  marijuanaPlantsUnits: num(),
  medicineType: z.string().nullable().optional(),
  medicineWeightGrams: num(),
  otherDrugType: z.string().nullable().optional(),
  otherDrugWeightGrams: num(),
  vehiclesUnits: num(),
  moneyAmount: num(),
  foreignMoneyAmount: num(),
  seizedProperty: z.boolean().optional(),

  // Step 3
  pistolsUnits: num(),
  revolverUnits: num(),
  homemadeGunUnits: num(),
  adaptedBlankGunUnits: num(),
  blankGunUnits: num(),
  shotgunUnits: num(),
  ammoUnits: num(),
  magazinesUnits: num(),
  rifleUnits: num(),
  assaultRifleUnits: num(),
  carbineUnits: num(),
  airgunUnits: num(),
  fantasyWeaponUnits: num(),
  grenadeUnits: num(),
  submachinegunUnits: num(),
  suppressorUnits: num(),
  antiTankShellUnits: num(),
  tearGasBombUnits: num(),
  molotovUnits: num(),
  fireworksUnits: num(),
});

export type ProcedureFormValues = z.infer<typeof procedureFormSchema>;
