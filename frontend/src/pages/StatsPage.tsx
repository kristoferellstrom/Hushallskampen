import { Link } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { useStats } from "../hooks/useStats";
import { StatsContent } from "../components/stats/StatsContent";
import { useApprovalsPage } from "../hooks/useApprovalsPage";
import { chartColor, fallbackColorForUser, shadeForPoints } from "../utils/palette";
import { getHousehold } from "../api";

type Props = { embedded?: boolean };

export const StatsPage = ({ embedded = false }: Props) => {
  const { token, user } = useAuth();
  const { weekly, monthly, error, balanceInfo, memberColors } = useStats(token);
  const { monthlyChoreLeaders, yearChoreLeaders, yearChoreTotals } = useApprovalsPage(200);
  const [weekIdx, setWeekIdx] = useState(0);
  const [monthIdx, setMonthIdx] = useState(0);
  const currentYear = new Date().getFullYear();
  const [choreRange, setChoreRange] = useState<"30d" | "year">("30d");
  const [householdMode, setHouseholdMode] = useState<"competition" | "equality">(
    () => (localStorage.getItem("householdMode") === "equality" ? "equality" : "competition"),
  );
  const showPoints = householdMode !== "equality";

  const topFromRecord = (rec?: any) => {
    if (!rec) return null;
    const sorted = [...(rec.totalsByUser || [])].sort((a: any, b: any) => b.points - a.points);
    const best = sorted[0];
    if (!best) return null;
    return { name: best.userId?.name || "-", points: best.points };
  };

  const weeklyLeader = topFromRecord(weekly[0]);
  const monthlyLeader = topFromRecord(monthly[0]);
  const yearlyLeader = (() => {
    if (!monthly.length) return null;
    const map: Record<string, { name: string; points: number }> = {};
    monthly.forEach((rec) =>
      rec.totalsByUser.forEach((t) => {
        const id = t.userId?._id || String((t.userId as any)?._id || (t.userId as any));
        if (!map[id]) map[id] = { name: t.userId?.name || "-", points: 0 };
        map[id].points += t.points;
      }),
    );
    const all = Object.values(map).sort((a, b) => b.points - a.points);
    return all[0] || null;
  })();

  useEffect(() => {
    setWeekIdx(0);
  }, [weekly]);

  useEffect(() => {
    setMonthIdx(0);
  }, [monthly]);

  useEffect(() => {
    const loadMode = async () => {
      try {
        if (!token) return;
        const res = await getHousehold(token);
        const mode = res.household?.mode === "equality" ? "equality" : "competition";
        setHouseholdMode(mode);
        localStorage.setItem("householdMode", mode);
      } catch {
        const mode = localStorage.getItem("householdMode") === "equality" ? "equality" : "competition";
        setHouseholdMode(mode);
      }
    };
    loadMode();
  }, [token]);

  const weekSlice = useMemo(() => (weekly[weekIdx] ? [weekly[weekIdx]] : []), [weekly, weekIdx]);
  const monthSlice = useMemo(() => (monthly[monthIdx] ? [monthly[monthIdx]] : []), [monthly, monthIdx]);
  const choreLeaders: Array<{ chore: string; user: string; userId: string; count: number }> =
    (choreRange === "30d" ? monthlyChoreLeaders : yearChoreLeaders) as any;

  const maxChoreCount = useMemo(
    () => choreLeaders.reduce((m, row) => Math.max(m, row.count), 0),
    [choreLeaders]
  );
  const yearAggregate = useMemo(() => {
    if (!monthly.length) return [];
    const map: Record<string, { name: string; points: number }> = {};
    monthly.forEach((rec) =>
      rec.totalsByUser.forEach((t) => {
        const id = t.userId?._id || String((t.userId as any)?._id || (t.userId as any));
        if (!map[id]) map[id] = { name: t.userId?.name || "-", points: 0 };
        map[id].points += t.points;
      }),
    );
    const totalsByUser = Object.entries(map).map(([id, val]) => ({
      userId: { _id: id, name: val.name },
      points: val.points,
    }));
    return [
      {
        periodStart: `${currentYear}-01-01`,
        periodEnd: `${currentYear}-12-31`,
        totalsByUser,
      },
    ];
  }, [monthly, currentYear]);

  const yearChoreSlices = useMemo(() => {
    const sorted = [...yearChoreTotals].sort((a, b) => b.count - a.count);
    return sorted.slice(0, 8);
  }, [yearChoreTotals]);

  const yearChorePie = useMemo(() => {
    const total = yearChoreSlices.reduce((sum, c) => sum + c.count, 0);
    let start = 0;
    const segments = yearChoreSlices.map((c, index) => {
      const base = chartColor(index);
      const slice = total > 0 ? (c.count / total) * 360 : 0;
      const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
      const entryStart = start;
      const entryEnd = start + slice;
      start = entryEnd;
      return { ...c, color: base, pct, start: entryStart, end: entryEnd };
    });

    const gradient =
      total > 0 && segments.length
        ? `conic-gradient(${segments.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(", ")})`
        : "#e2e8f0";

    return { segments, gradient, total };
  }, [yearChoreSlices]);

  const ownColor = (user?.id && (memberColors as any)[user.id]) || user?.color || "";
  const baseColor = ownColor || fallbackColorForUser(user?.id || "");
  const bgBase = shadeForPoints(baseColor, 1); 
  const surface = bgBase;
  const weekControls = {
    onPrev: () => setWeekIdx((i) => Math.min(i + 1, weekly.length - 1)),
    onNext: () => setWeekIdx((i) => Math.max(i - 1, 0)),
    canPrev: weekIdx < weekly.length - 1,
    canNext: weekIdx > 0,
    label: weekSlice[0]
      ? `${weekSlice[0].periodStart.slice(0, 10)} – ${weekSlice[0].periodEnd.slice(0, 10)}`
      : "Ingen data",
  };
  const monthControls = {
    onPrev: () => setMonthIdx((i) => Math.min(i + 1, monthly.length - 1)),
    onNext: () => setMonthIdx((i) => Math.max(i - 1, 0)),
    canPrev: monthIdx < monthly.length - 1,
    canNext: monthIdx > 0,
    label: monthSlice[0]
      ? `${monthSlice[0].periodStart.slice(0, 10)} – ${monthSlice[0].periodEnd.slice(0, 10)}`
      : "Ingen data",
  };

  if (embedded) {
    return (
      <div
      className="page-surface"
      style={{
        background: surface,
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        padding: "60px 0 60px",
      }}
    >
      <section id="statistik">
          <StatsContent
            error={error}
            showPoints={showPoints}
            weeklyLeader={weeklyLeader}
            monthlyLeader={monthlyLeader}
            yearlyLeader={yearlyLeader}
            weekSlice={weekSlice}
            monthSlice={monthSlice}
            yearAggregate={yearAggregate}
            balanceInfo={balanceInfo}
            memberColors={memberColors}
            weekControls={weekControls}
            monthControls={monthControls}
            currentYear={currentYear}
            yearChorePie={yearChorePie}
            choreLeaders={choreLeaders}
            choreRange={choreRange}
            setChoreRange={setChoreRange}
            maxChoreCount={maxChoreCount}
          />
      </section>
    </div>
  );
}

  return (
    <div
      className="page-surface"
      style={{
        background: surface,
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        padding: "48px 0 32px",
      }}
    >
      <div className="shell">
        <Link className="back-link" to="/dashboard">
          ← Till dashboard
        </Link>
        <Logo />
        <StatsContent
          error={error}
          showPoints={showPoints}
          weeklyLeader={weeklyLeader}
          monthlyLeader={monthlyLeader}
          yearlyLeader={yearlyLeader}
          weekSlice={weekSlice}
          monthSlice={monthSlice}
          yearAggregate={yearAggregate}
          balanceInfo={balanceInfo}
          memberColors={memberColors}
          weekControls={weekControls}
          monthControls={monthControls}
          currentYear={currentYear}
          yearChorePie={yearChorePie}
          choreLeaders={choreLeaders}
          choreRange={choreRange}
          setChoreRange={setChoreRange}
          maxChoreCount={maxChoreCount}
        />
      </div>
    </div>
  );
};
