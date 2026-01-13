import { request } from "./http";

export async function listApprovals(token: string) {
  return request<{
    approvals: Array<{
      _id: string;
      submittedByUserId: { _id: string; name: string; email: string; color?: string };
      calendarEntryId: {
        _id: string;
        date: string;
        status: string;
        assignedToUserId: { _id: string; name: string; email: string; color?: string };
        choreId: { _id: string; title: string; defaultPoints: number };
      };
    }>;
  }>("/approvals", { method: "GET", token });
}

export async function listApprovalHistory(token: string, limit = 10) {
  return request<{
    approvals: Array<{
      _id: string;
      status: string;
      comment?: string;
      createdAt: string;
      submittedByUserId: { _id: string; name: string; email: string; color?: string };
      reviewedByUserId?: { _id: string; name: string; email: string; color?: string };
      calendarEntryId: {
        _id: string;
        date: string;
        status: string;
        assignedToUserId: { _id: string; name: string; email: string; color?: string };
        choreId: { _id: string; title: string; defaultPoints: number };
      };
    }>;
  }>(`/approvals/history?limit=${limit}`, { method: "GET", token });
}

export async function reviewApproval(token: string, id: string, action: "approve" | "reject", comment?: string) {
  return request<{ approval: any; entry: any }>(`/approvals/${id}/review`, {
    method: "POST",
    token,
    body: { action, comment },
  });
}
