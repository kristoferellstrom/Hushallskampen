import { request } from "./http";

export async function updateColor(token: string, color: string) {
  return request<{ color: string }>("/users/color", { method: "PATCH", token, body: { color } });
}
