import { request } from "./http";

export async function fetchHealth() {
  return request<{ status: string; db?: "mongo" | "memory" }>("/health", { method: "GET" });
}
