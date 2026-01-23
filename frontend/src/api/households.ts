import { request } from "./http";

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

export async function getHousehold(token: string) {
  return request<{
    household:
      | {
          _id: string;
          name: string;
          inviteCode: string;
          mode?: string;
          weeklyPrizeText?: string;
          rulesText?: string;
          targetShares?: Array<{ userId: string; targetPct: number }>;
        }
      | null;
  }>("/households/me", {
    method: "GET",
    token,
  });
}

export async function listMembers(token: string) {
  return request<{ members: Array<{ _id: string; name: string; email: string; color?: string }> }>("/households/members", {
    method: "GET",
    token,
  });
}

export async function updateHousehold(
  token: string,
  data: {
    name?: string;
    mode?: "competition" | "equality";
    weeklyPrizeText?: string;
    rulesText?: string;
    targetShares?: Array<{ userId: string; targetPct: number }>;
  },
) {
  return request<{ household: any }>("/households/me", { method: "PATCH", token, body: data });
}
