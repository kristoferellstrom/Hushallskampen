const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

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
  data: { title?: string; description?: string; defaultPoints?: number; isActive?: boolean },
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

export async function listMembers(token: string) {
  return request<{ members: Array<{ _id: string; name: string; email: string }> }>("/households/members", {
    method: "GET",
    token,
  });
}

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
      assignedToUserId: { _id: string; name: string; email: string };
      choreId: { _id: string; title: string; defaultPoints: number };
    }>;
  }>(`/calendar${qs}`, { method: "GET", token });
}

export async function createCalendarEntry(token: string, data: { choreId: string; date: string; assignedToUserId: string }) {
  return request<{ entry: { _id: string } }>("/calendar", { method: "POST", token, body: data });
}

export async function updateCalendarEntry(
  token: string,
  id: string,
  data: { date?: string; assignedToUserId?: string; status?: string },
) {
  return request<{ entry: { _id: string } }>(`/calendar/${id}`, { method: "PUT", token, body: data });
}

export async function deleteCalendarEntry(token: string, id: string) {
  return request<{ success: boolean }>(`/calendar/${id}`, { method: "DELETE", token });
}

export async function submitCalendarEntry(token: string, id: string) {
  return request<{ entry: any; approval: any }>(`/calendar/${id}/submit`, { method: "POST", token });
}

export async function listApprovals(token: string) {
  return request<{
    approvals: Array<{
      _id: string;
      submittedByUserId: { _id: string; name: string; email: string };
      calendarEntryId: {
        _id: string;
        date: string;
        status: string;
        assignedToUserId: { _id: string; name: string; email: string };
        choreId: { _id: string; title: string; defaultPoints: number };
      };
    }>;
  }>("/approvals", { method: "GET", token });
}

export async function reviewApproval(token: string, id: string, action: "approve" | "reject", comment?: string) {
  return request<{ approval: any; entry: any }>(`/approvals/${id}/review`, { method: "POST", token, body: { action, comment } });
}

export async function fetchWeeklyStats(token: string) {
  return request<{ totals: Array<{ periodStart: string; periodEnd: string; totalsByUser: Array<{ userId: { _id: string; name: string }; points: number }> }> }>(
    "/stats/weekly",
    { method: "GET", token },
  );
}

export async function fetchMonthlyStats(token: string) {
  return request<{ totals: Array<{ periodStart: string; periodEnd: string; totalsByUser: Array<{ userId: { _id: string; name: string }; points: number }> }> }>(
    "/stats/monthly",
    { method: "GET", token },
  );
}
