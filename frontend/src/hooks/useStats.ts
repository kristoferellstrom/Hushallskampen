import { useCallback, useEffect,  useState } from "react";
import { fetchMonthlyStats, fetchWeeklyStats, getHousehold } from "../api/client";

export type StatItem = {
  periodStart: string;
  periodEnd: string;
  totalsByUser: Array<{ userId: { _id: string; name: string }; points: number }>;
};

type BalanceDelta = {
  userId: { _id: string; name: string };
  points: number;
  pct: number;
  target: number;
  diff: number;
};

export type BalanceInfo = {
  deltas: BalanceDelta[];
  top?: BalanceDelta;
  bottom?: BalanceDelta;
  totalPoints: number;
};

export const useStats = (token: string | null | undefined) => {
  const [weekly, setWeekly] = useState<StatItem[]>([]);
  const [monthly, setMonthly] = useState<StatItem[]>([]);
  const [error, setError] = useState("");
  const [targets, setTargets] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      const [w, m, h] = await Promise.all([fetchWeeklyStats(token), fetchMonthlyStats(token), getHousehold(token)]);

      if (h.household?.targetShares) {
        const map: Record<string, number> = {};
        h.household.targetShares.forEach((t: { userId: string; targetPct: number }) => (map[t.userId] = t.targetPct));
        setTargets(map);
      } else {
        setTargets({});
      }

      setWeekly(w.totals);
      setMonthly(m.totals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta stats");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const balanceInfo = useCallback(
    (rec: StatItem): BalanceInfo => {
      const totalPoints = rec.totalsByUser.reduce((sum, t) => sum + t.points, 0);
      const members = rec.totalsByUser.length || 1;
      const targetShare = 100 / members;

      const deltas: BalanceDelta[] = rec.totalsByUser.map((t) => {
        const pct = totalPoints > 0 ? (t.points / totalPoints) * 100 : 0;
        const target = targets[t.userId._id] !== undefined ? targets[t.userId._id] : targetShare;
        return { ...t, pct, target, diff: pct - target };
      });

      const sorted = [...deltas].sort((a, b) => b.pct - a.pct);

      return {
        deltas,
        top: sorted[0],
        bottom: sorted[sorted.length - 1],
        totalPoints,
      };
    },
    [targets]
  );

  return { weekly, monthly, error, targets, load, balanceInfo, setError };
};
