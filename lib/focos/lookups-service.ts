import { apiFetch } from "@/lib/api/api-client";

export type ComunaItem = {
  id: string;
  name: string;
  is_active: boolean;
};

export type UserItem = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role_id: string | null;
  is_active: boolean;
};

export type FocoStatusItem = {
  id: string;
  name: string;
  is_active: boolean;
};

export async function fetchComunas(): Promise<ComunaItem[]> {
  const items = await apiFetch<ComunaItem[]>("/comunas", { method: "GET" });
  const list = Array.isArray(items) ? items : [];
  return list.filter((x) => x.is_active);
}

export async function fetchAnalistas(): Promise<UserItem[]> {
  const items = await apiFetch<UserItem[]>("/users/analysts", { method: "GET" });
  const list = Array.isArray(items) ? items : [];
  return list.filter((x) => x.is_active);
}

export async function fetchFiscales(): Promise<UserItem[]> {
  const items = await apiFetch<UserItem[]>("/users/fiscals", { method: "GET" });
  const list = Array.isArray(items) ? items : [];
  return list.filter((x) => x.is_active);
}

export async function fetchFocoStatuses(): Promise<FocoStatusItem[]> {
  const items = await apiFetch<FocoStatusItem[]>("/foco-status", { method: "GET" });
  const list = Array.isArray(items) ? items : [];
  return list.filter((x) => x.is_active);
}
