// src/lib/auth/auth-service.ts

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  email?: string | null;
};

export type BackendLoginData = {
  accessToken: string;
  user: AuthUser;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiFail = { success: false; message?: string };
type ApiResponse<T> = ApiSuccess<T> | ApiFail;

const STORAGE_TOKEN_KEY = "accessToken";
const STORAGE_USER_KEY = "currentUser";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // ej: http://localhost:3000/api

function ensureApiUrl() {
  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL in .env.local");
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Guarda sesión (token + usuario) en localStorage
 */
export function setSession(data: BackendLoginData) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_TOKEN_KEY, data.accessToken);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
}

/**
 * Devuelve el token actual
 */
export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

/**
 * Devuelve el usuario logeado (desde localStorage)
 */
export function getCurrentUser(): AuthUser | null {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(STORAGE_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Cierra sesión limpiando storage (+ cookie si la usas en middleware)
 */
export function logout() {
  if (!isBrowser()) return;

  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);

  // Si estabas usando cookie para tu middleware actual:
  document.cookie = "dataview_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

/**
 * Login REAL contra backend: POST /api/auth/login
 */
export async function loginWithBackend(params: { username: string; password: string }) {
  ensureApiUrl();

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const json = (await res.json()) as ApiResponse<BackendLoginData>;

  if (!res.ok || !json.success) {
    const message = (json as ApiFail)?.message ?? "Credenciales inválidas";
    throw new Error(message);
  }

  // Guarda sesión
  setSession(json.data);

  // Si sigues usando cookie para middleware en Next:
  if (isBrowser()) {
    document.cookie = `dataview_user=true; path=/;`;
  }

  return json.data;
}
