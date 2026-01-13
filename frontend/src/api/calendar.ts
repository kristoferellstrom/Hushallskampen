import { request } from "./http";

export async function listCalendar(token: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return request<{
    entries: Array<{
      _id: string;
      date: string;
      status: string;
      assignedToUserId: { _id: string; name: string; email: string; color?: string };
      choreId: { _id: string; title: string; defaultPoints: number };
    }>;
  }>(`/calendar${qs}`, { method: "GET", token });
}

export async function createCalendarEntry(token: string, data: { choreId: string; date: string; assignedToUserId: string }) {
  return request<{ entry: { _id: string } }>("/calendar", { method: "POST", token, body: data });
}

export async function updateCalendarEntry(token: string, id: string, data: { date?: string; assignedToUserId?: string; status?: string }) {
  return request<{ entry: { _id: string } }>(`/calendar/${id}`, { method: "PUT", token, body: data });
}

export async function deleteCalendarEntry(token: string, id: string) {
  return request<{ success: boolean }>(`/calendar/${id}`, { method: "DELETE", token });
}

export async function submitCalendarEntry(token: string, id: string) {
  return request<{ entry: any; approval: any }>(`/calendar/${id}/submit`, { method: "POST", token });
}

export async function copyLastWeek(token: string) {
  return request<{ created: any[] }>("/calendar/copy-last-week", { method: "POST", token });
}
