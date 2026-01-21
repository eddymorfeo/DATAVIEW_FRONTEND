import { getAccessToken, logout } from "@/lib/auth/auth-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ensureApiUrl() {
  if (!API_URL) throw new Error("Missing NEXT_PUBLIC_API_URL in .env.local");
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  ensureApiUrl();

  const token = getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
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

  return (json?.data ?? json?.items ?? json) as T;
}
