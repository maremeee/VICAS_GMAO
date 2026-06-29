// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Récupère le token stocké ──────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("vicas-auth-storage");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

// ── Fonction de requête centrale ──────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Laravel retourne { message, errors }
    throw {
      status: response.status,
      message: data.message ?? "Une erreur est survenue.",
      errors: data.errors ?? {},
    };
  }

  return data as T;
}

// ── Méthodes HTTP ─────────────────────────────────────
export const api = {
  get: <T>(url: string) =>
    request<T>(url, { method: "GET" }),

  post: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string) =>
    request<T>(url, { method: "DELETE" }),
};