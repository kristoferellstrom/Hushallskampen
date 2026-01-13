import { request } from "./http";

export async function fetchWeeklyStats(token: string) {
  return request<{
    totals: Array<{
      periodStart: string;
      periodEnd: string;
      totalsByUser: Array<{ userId: { _id: string; name: string; color?: string | null }; points: number }>;
    }>;
  }>("/stats/weekly", { method: "GET", token });
}

export async function fetchMonthlyStats(token: string) {
  return request<{
    totals: Array<{
      periodStart: string;
      periodEnd: string;
      totalsByUser: Array<{ userId: { _id: string; name: string; color?: string | null }; points: number }>;
    }>;
  }>("/stats/monthly", { method: "GET", token });
}
