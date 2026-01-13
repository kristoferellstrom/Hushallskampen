import { request } from "./http";

export type AuthUser = { id: string; name: string; email: string; householdId?: string };

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
