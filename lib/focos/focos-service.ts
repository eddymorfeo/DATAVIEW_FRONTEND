import { apiFetch } from "@/lib/api/api-client";
import type { Foco } from "@/lib/focos/types";

/**
 * ✅ Payload "canonico" que el backend valida (según Postman):
 * isCompleted (NO isComplete)
 */
export type FocoUpsertInput = {
  focoNumber: number;
  focoYear: number;
  title: string;
  description: string;

  comunaId: string;
  statusId: string;
  analystId: string | null;
  assignedToId: string | null;

  isCompleted: boolean;
  ordenInvestigar: boolean;
  instruccionParticular: boolean;
  diligencias: boolean;
  reunionPolicial: boolean;
  informes: boolean;
  procedimientos: boolean;

  createdBy: string;
};

/**
 * ✅ Compatibilidad hacia atrás:
 * tu form actual usa isComplete y funcionaba.
 * NO lo vamos a romper.
 */
export type FocoUpsertInputLegacy = Omit<FocoUpsertInput, "isCompleted"> & {
  isComplete: boolean;
};

/**
 * ✅ Aceptamos ambos para CREATE/UPDATE.
 * El service normaliza y siempre envía isCompleted al backend.
 */
export type CreateFocoInput = FocoUpsertInput | FocoUpsertInputLegacy;
export type UpdateFocoInput = FocoUpsertInput | FocoUpsertInputLegacy;

type ListResponse<T> = {
  success: boolean;
  items: T[];
  total?: number;
  limit?: number;
  offset?: number;
};

/**
 * ✅ Normaliza cualquier input a formato canonico del backend
 * (si viene isComplete, lo convierte a isCompleted)
 */
function normalizeUpsertInput(input: CreateFocoInput | UpdateFocoInput): FocoUpsertInput {
  const isCompleted =
    "isCompleted" in input ? Boolean(input.isCompleted) : Boolean(input.isComplete);

  const normalized: FocoUpsertInput = {
    focoNumber: input.focoNumber,
    focoYear: input.focoYear,
    title: input.title,
    description: input.description,

    comunaId: input.comunaId,
    statusId: input.statusId,

    analystId: input.analystId ?? null,
    assignedToId: input.assignedToId ?? null,

    isCompleted,

    ordenInvestigar: Boolean(input.ordenInvestigar),
    instruccionParticular: Boolean(input.instruccionParticular),
    diligencias: Boolean(input.diligencias),
    reunionPolicial: Boolean(input.reunionPolicial),
    informes: Boolean(input.informes),
    procedimientos: Boolean(input.procedimientos),

    createdBy: input.createdBy,
  };

  return normalized;
}

export async function fetchFocos(): Promise<Foco[]> {
  const res = await apiFetch<Foco[] | ListResponse<Foco>>("/focos", { method: "GET" });
  return Array.isArray(res) ? res : res.items ?? [];
}

/**
 * ✅ POST /focos
 * Recibe input con isComplete (legacy) o isCompleted (nuevo).
 * Siempre envía isCompleted al backend.
 */
export async function createFoco(input: CreateFocoInput): Promise<Foco> {
  const payload = normalizeUpsertInput(input);

  return apiFetch<Foco>("/focos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * ✅ PUT /focos/:id
 * Recibe input con isComplete (legacy) o isCompleted (nuevo).
 * Siempre envía isCompleted al backend.
 */
export async function updateFoco(id: string, input: UpdateFocoInput): Promise<Foco> {
  const payload = normalizeUpsertInput(input);

  return apiFetch<Foco>(`/focos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * ✅ DELETE /focos/:id
 */
export async function deleteFoco(id: string): Promise<void> {
  await apiFetch<void>(`/focos/${id}`, { method: "DELETE" });
}

/**
 * ✅ Helper: mapea un Foco (snake_case del GET) al payload camelCase que el backend valida.
 * (Siempre devuelve el formato canonico con isCompleted)
 */
export function focoToPayload(foco: Foco): FocoUpsertInput {
  return {
    focoNumber: foco.foco_number,
    focoYear: foco.foco_year,
    title: foco.title,
    description: foco.description ?? "",

    comunaId: foco.comuna_id,
    statusId: foco.status_id,

    analystId: foco.analyst_id ?? null,
    assignedToId: foco.assigned_to_id ?? null,

    isCompleted: Boolean(foco.is_completed),

    ordenInvestigar: Boolean(foco.orden_investigar),
    instruccionParticular: Boolean(foco.instruccion_particular),
    diligencias: Boolean(foco.diligencias),
    reunionPolicial: Boolean(foco.reunion_policial),
    informes: Boolean(foco.informes),
    procedimientos: Boolean(foco.procedimientos),

    createdBy: foco.created_by ?? "",
  };
}
