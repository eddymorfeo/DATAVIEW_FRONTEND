import { apiFetch, apiFetchRaw } from "@/lib/api/api-client";
import type { Homicide, PagedResult } from "@/lib/focos/types";

type ApiPagedResponse<T> = {
  success: true;
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type HomicideListParams = {
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;

  ruc?: string;
  comunaId?: string;
  weaponId?: string;
  caseStatusId?: string;
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
};

export type HomicideUpsertInput = {
  ruc: string;
  date: string; // ISO string (backend zod datetime)
  fullName?: string | null;
  rut?: string | null;
  address?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  weaponId: string;
  comunaId: string;
  caseStatusId: string;

  isActive?: boolean;
};

function toNumberOrNull(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeHomicide(item: Homicide): Homicide {
  return {
    ...item,
    latitude: toNumberOrNull(item.latitude),
    longitude: toNumberOrNull(item.longitude),
  };
}

function buildQuery(params: HomicideListParams) {
  const q = new URLSearchParams();

  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  if (params.includeInactive != null) q.set("includeInactive", String(params.includeInactive));

  if (params.ruc) q.set("ruc", params.ruc);
  if (params.comunaId) q.set("comunaId", params.comunaId);
  if (params.weaponId) q.set("weaponId", params.weaponId);
  if (params.caseStatusId) q.set("caseStatusId", params.caseStatusId);

  if (params.dateFrom) q.set("dateFrom", params.dateFrom);
  if (params.dateTo) q.set("dateTo", params.dateTo);

  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

/**
 * ✅ GET /homicides (paginado)
 * Usamos apiFetchRaw para NO perder meta.
 */
export async function fetchHomicides(params: HomicideListParams = {}): Promise<PagedResult<Homicide>> {
  const query = buildQuery({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    ...params,
  });

  // OJO: tu backend es /api/homicides, tu base ya incluye /api.
  // Si alguien pasa "/api/homicides", api-client evita /api/api.
  const res = await apiFetchRaw<ApiPagedResponse<Homicide>>(`/homicides${query}`, { method: "GET" });

  return {
    items: (res.items ?? []).map(normalizeHomicide),
    meta: res.meta,
  };
}

/**
 * ✅ POST /homicides
 */
export async function createHomicide(input: HomicideUpsertInput): Promise<Homicide> {
  const payload = {
    ruc: input.ruc,
    date: input.date,
    fullName: input.fullName ?? null,
    rut: input.rut ?? null,
    address: input.address ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    weaponId: input.weaponId,
    comunaId: input.comunaId,
    caseStatusId: input.caseStatusId,
    isActive: input.isActive ?? true,
  };

  const created = await apiFetch<Homicide>("/homicides", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeHomicide(created);
}

/**
 * ✅ PUT /homicides/:id
 */
export async function updateHomicide(id: string, input: HomicideUpsertInput): Promise<Homicide> {
  const payload = {
    ruc: input.ruc,
    date: input.date,
    fullName: input.fullName ?? null,
    rut: input.rut ?? null,
    address: input.address ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    weaponId: input.weaponId,
    comunaId: input.comunaId,
    caseStatusId: input.caseStatusId,
    isActive: input.isActive ?? true,
  };

  const updated = await apiFetch<Homicide>(`/homicides/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return normalizeHomicide(updated);
}

/**
 * ✅ DELETE /homicides/:id (soft delete en backend)
 */
export async function deleteHomicide(id: string): Promise<void> {
  await apiFetch<void>(`/homicides/${id}`, { method: "DELETE" });
}
