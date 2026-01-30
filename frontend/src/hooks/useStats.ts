import { useCallback, useEffect, useState } from "react";
import { fetchMonthlyStats, fetchWeeklyStats, getHousehold, listMembers } from "../api/index.ts";
import { onDataUpdated } from "../utils/appEvents";

export type StatItem = {
  periodStart: string;
  periodEnd: string;
  totalsByUser: Array<{ userId: { _id: string; name: string; color?: string | null }; points: number }>;
};

type BalanceDelta = {
  userId: { _id: string; name: string; color?: string | null };
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
  const [memberColors, setMemberColors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      const [w, m, h, members] = await Promise.all([
        fetchWeeklyStats(token),
        fetchMonthlyStats(token),
        getHousehold(token),
        listMembers(token),
      ]);

      if (h.household?.targetShares) {
        const map: Record<string, number> = {};
        h.household.targetShares.forEach((t: { userId: any; targetPct: number }) => (map[String(t.userId)] = t.targetPct));
        setTargets(map);
      } else {
        setTargets({});
      }

      if (members.members) {
        const cm: Record<string, string> = {};
        members.members.forEach((m: { _id: string; color?: string }) => {
          if (m.color) cm[m._id] = m.color;
        });
        setMemberColors(cm);
      } else {
        setMemberColors({});
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

  useEffect(() => onDataUpdated(load), [load]);

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

  return { weekly, monthly, error, targets, memberColors, load, balanceInfo, setError };
};
