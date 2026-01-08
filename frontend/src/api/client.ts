const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

type HttpMethod = "GET" | "POST";

async function request<T>(path: string, options: { method?: HttpMethod; body?: any; token?: string } = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res.json() as Promise<T>;
}

type AuthUser = { id: string; name: string; email: string; householdId?: string };

export async function register(name: string, email: string, password: string) {
  return request<{ token: string; user: AuthUser }>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function login(email: string, password: string) {
  return request<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function getMe(token: string) {
  return request<{ user: AuthUser }>("/auth/me", { method: "GET", token });
}

export async function fetchChores(token: string) {
  return request<{ chores: Array<{ _id: string; title: string; defaultPoints: number }> }>("/chores", {
    method: "GET",
    token,
  });
}

export async function createHousehold(token: string, name: string, mode: "competition" | "equality" = "competition") {
  return request<{ household: { _id: string; name: string; inviteCode: string } }>("/households", {
    method: "POST",
    token,
    body: { name, mode },
  });
}

export async function joinHousehold(token: string, inviteCode: string) {
  return request<{ household: { _id: string; name: string; inviteCode: string } }>("/households/join", {
    method: "POST",
    token,
    body: { inviteCode },
  });
}
