import { request } from "./http";

export async function fetchChores(token: string) {
  return request<{ chores: Array<{ _id: string; title: string; defaultPoints: number; description?: string; isDefault?: boolean; isActive?: boolean; slug?: string }> }>("/chores", {
    method: "GET",
    token,
  });
}

export async function createChore(token: string, data: { title: string; description?: string; defaultPoints?: number }) {
  return request<{ chore: { _id: string } }>("/chores", {
    method: "POST",
    token,
    body: data,
  });
}

export async function updateChore(
  token: string,
  id: string,
  data: { title?: string; description?: string; defaultPoints?: number; isActive?: boolean }
) {
  return request<{ chore: { _id: string } }>(`/chores/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export async function deleteChore(token: string, id: string) {
  return request<{ success: boolean }>(`/chores/${id}`, {
    method: "DELETE",
    token,
  });
}
