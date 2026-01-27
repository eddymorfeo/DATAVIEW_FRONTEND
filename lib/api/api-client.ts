import { getAccessToken, logout } from "@/lib/auth/auth-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ensureApiUrl() {
  if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL in .env.local");
}

/**
 * ✅ Evita /api/api cuando:
 * - API_URL termina con /api
 * - path empieza con /api
 *
 * Mantiene compatibilidad con tu sistema actual (focos ya funciona).
 */
function buildApiUrl(path: string) {
  ensureApiUrl();

  const base = (API_URL ?? "").replace(/\/+$/, ""); // sin slash final
  const normalizedPath = (() => {
    const p = path.startsWith("/") ? path : `/${path}`;

    const baseEndsWithApi =
      base.endsWith("/api") || base.endsWith("/api/");

    const pathStartsWithApi = p === "/api" || p.startsWith("/api/");

    // Si ambos tienen /api, lo eliminamos del path
    if (baseEndsWithApi && pathStartsWithApi) {
      return p.replace(/^\/api/, "") || "/";
    }

    return p;
  })();

  return `${base}${normalizedPath}`;
}

/**
 * ✅ Mantengo tu apiFetch SIN romper comportamiento.
 * Solo cambio la URL para evitar /api/api
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  ensureApiUrl();

  const token = getAccessToken();
  const url = buildApiUrl(path);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    logout();
    throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
  }

  // ✅ Soporta DELETE 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message ?? "Error en la solicitud");
  }

  if (json?.success === false) {
    throw new Error(json?.message ?? "Error en la solicitud");
  }

  // ⚠️ Mantengo TU unwrapping (data/items/json)
  return (json?.data ?? json?.items ?? json) as T;
}

/**
 * ✅ NUEVO: Para endpoints paginados (items + meta), necesitamos el JSON COMPLETO
 * porque apiFetch hoy devuelve SOLO items y se pierde meta.
 */
export async function apiFetchRaw<T>(path: string, options: RequestInit = {}): Promise<T> {
  ensureApiUrl();

  const token = getAccessToken();
  const url = buildApiUrl(path);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    logout();
    throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error((json as any)?.message ?? "Error en la solicitud");
  }

  if ((json as any)?.success === false) {
    throw new Error((json as any)?.message ?? "Error en la solicitud");
  }

  return json as T;
}
