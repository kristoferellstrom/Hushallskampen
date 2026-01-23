import { request } from "./http";

export type MonthlyBadgeWinner = { userId: string; name?: string; wins: number };
export type MonthlyBadgeMonthWinner = { userId: string; name?: string; count: number };
export type MonthlyBadge = {
  slug: string;
  title: string;
  image?: string;
  winners: MonthlyBadgeWinner[];
  monthWinners?: MonthlyBadgeMonthWinner[];
};
export type PointsWinner = { userId: string; name?: string; points: number };

export async function fetchMonthlyBadges(token: string) {
  return request<{
    badges: MonthlyBadge[];
    monthPointsWinner?: PointsWinner | null;
    yearPointsWinner?: PointsWinner | null;
    latestCompletedMonthKey?: string | null;
  }>(
    "/achievements/monthly-badges",
    {
      method: "GET",
      token,
    },
  );
}
