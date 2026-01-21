import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { useStats } from "../hooks/useStats";
import { StatsCard } from "../components/stats/StatsCard";
import { useApprovalsPage } from "../hooks/useApprovalsPage";
import { colorPreview, fallbackColorForUser, textColorForBackground, shadeForPoints } from "../utils/palette";
import { useEffect, useMemo, useState } from "react";

type Props = { embedded?: boolean };

export const StatsPage = ({ embedded = false }: Props) => {
  const { token, user } = useAuth();
  const { weekly, monthly, error, balanceInfo, memberColors } = useStats(token);
  const { monthlyChoreLeaders, yearChoreLeaders } = useApprovalsPage(200);
  const [weekIdx, setWeekIdx] = useState(0);
  const [monthIdx, setMonthIdx] = useState(0);
  const currentYear = new Date().getFullYear();
  const [choreRange, setChoreRange] = useState<"30d" | "year">("30d");

  const toAlpha = (hex: string, alpha: number) => {
    const color = colorPreview(hex) || hex;
    if (!color.startsWith("#") || (color.length !== 7 && color.length !== 4)) return color;
    const full = color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color;
    const r = parseInt(full.slice(1, 3), 16);
    const g = parseInt(full.slice(3, 5), 16);
    const b = parseInt(full.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

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

  const weekSlice = useMemo(() => (weekly[weekIdx] ? [weekly[weekIdx]] : []), [weekly, weekIdx]);
  const monthSlice = useMemo(() => (monthly[monthIdx] ? [monthly[monthIdx]] : []), [monthly, monthIdx]);
  const choreLeaders: Array<{ chore: string; user: string; userId: string; count: number }> =
    (choreRange === "30d" ? monthlyChoreLeaders : yearChoreLeaders) as any;
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

  const ownColor = (user?.id && (memberColors as any)[user.id]) || user?.color || "";
  const baseColor = ownColor || fallbackColorForUser(user?.id || "");
  const bgBase = shadeForPoints(baseColor, 1); // ljusaste nyansen (poäng 1)
  const surface = bgBase;

  const content = (
    <>
      {error && <p className="status error">{error}</p>}

      <div className="leader-strip">
        <div className="leader-card">
          <p className="eyebrow">Vecka</p>
          <p className="leader-name">{weeklyLeader?.name || "Ingen data"}</p>
          <p className="leader-points">{weeklyLeader ? `${weeklyLeader.points}p` : "–"}</p>
        </div>
        <div className="leader-card">
          <p className="eyebrow">Månad</p>
          <p className="leader-name">{monthlyLeader?.name || "Ingen data"}</p>
          <p className="leader-points">{monthlyLeader ? `${monthlyLeader.points}p` : "–"}</p>
        </div>
        <div className="leader-card">
          <p className="eyebrow">År</p>
          <p className="leader-name">{yearlyLeader?.name || "Ingen data"}</p>
          <p className="leader-points">{yearlyLeader ? `${yearlyLeader.points}p` : "–"}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Veckosummeringar"
          description="Summerar poäng per hushållsmedlem för aktuell vecka. Bläddra för tidigare veckor för att se hur fördelningen förändras och om hushållet närmar sig era mål över tid."
          items={weekSlice}
          balanceInfo={balanceInfo}
          colorMap={memberColors}
          hidePeriodLabel
          hideTotal
          stackedBalance
          sortByPoints
          figureSrc="/figure/woman_shopping.png"
          controls={{
            onPrev: () => setWeekIdx((i) => Math.min(i + 1, weekly.length - 1)),
            onNext: () => setWeekIdx((i) => Math.max(i - 1, 0)),
            canPrev: weekIdx < weekly.length - 1,
            canNext: weekIdx > 0,
            label: weekSlice[0]
              ? `${weekSlice[0].periodStart.slice(0, 10)} – ${weekSlice[0].periodEnd.slice(0, 10)}`
              : "Ingen data",
          }}
          listClassName="scroll-5"
        />
        <StatsCard
          title="Månads-summeringar"
          description="Visar varje medlems poäng och andel för aktuell månad. Bläddra bakåt för att se hur fördelningen ändras månad för månad och om hushållet håller jämna steg med era mål."
          items={monthSlice}
          balanceInfo={balanceInfo}
          colorMap={memberColors}
          hidePeriodLabel
          hideTotal
          stackedBalance
          sortByPoints
          figureSrc="/figure/man_washing.png"
          controls={{
            onPrev: () => setMonthIdx((i) => Math.min(i + 1, monthly.length - 1)),
            onNext: () => setMonthIdx((i) => Math.max(i - 1, 0)),
            canPrev: monthIdx < monthly.length - 1,
            canNext: monthIdx > 0,
            label: monthSlice[0]
              ? `${monthSlice[0].periodStart.slice(0, 10)} – ${monthSlice[0].periodEnd.slice(0, 10)}`
              : "Ingen data",
          }}
          listClassName="scroll-5"
        />
        <StatsCard
          title="Årssummering"
          description="Ackumulerade poäng per hushållsmedlem för året. Följ vem som leder när månaderna adderas ihop, se trenderna över längre tid och peppa familjen att kämpa om den spektakulära badge:n (märket) 'Årsvinnaren'. Perfekt för att utvärdera insatser och justera mål inför nästa år."
          items={yearAggregate}
          balanceInfo={balanceInfo}
          colorMap={memberColors}
          hidePeriodLabel
          hideTotal
          stackedBalance
          sortByPoints
          figureSrc=""
          controls={{
            label: `${currentYear}`,
            canPrev: false,
            canNext: false,
          }}
          listClassName="scroll-5"
          footer={
            <img
              src="/figure/stats.png"
              alt="Statistikillustration"
              className="stat-figure-wide"
            />
          }
        />
        {choreLeaders.length > 0 && (
          <div className="card stats-card">
            <div className="stats-head">
              <h2>Flest utförda per syssla</h2>
              <p className="stat-desc">
                Se vem som gjort flest av varje syssla. Växla mellan senaste 30 dagarna och året för att följa trender.
              </p>
              <div className="stat-controls">
                <button
                  className={`stat-nav-btn ${choreRange === "30d" ? "active" : ""}`}
                  onClick={() => setChoreRange("30d")}
                >
                  30 dagar
                </button>
                <button
                  className={`stat-nav-btn ${choreRange === "year" ? "active" : ""}`}
                  onClick={() => setChoreRange("year")}
                >
                  År
                </button>
              </div>
            </div>
            <div className="stat-block">
              <ul className="list scroll-10">
                {choreLeaders.map((row) => (
                  (() => {
                    const base = memberColors[row.userId] || row.userId || "";
                    const strong = colorPreview(base) || base || fallbackColorForUser(row.userId || "");
                    const bgStart = toAlpha(strong, 1);
                    const bgEnd = toAlpha(strong, 0.85);
                    const bg = `linear-gradient(90deg, ${bgStart}, ${bgEnd})`;
                    const fg = textColorForBackground(strong);
                    return (
                      <li key={`${row.chore}-${choreRange}`} className="row user-row" style={{ background: bg, color: fg }}>
                        <div className="user-text">
                          <span className="user-name">{row.chore}</span>
                          <span className="user-meta">Flest av: {row.user}</span>
                        </div>
                        <strong className="user-points">{row.count} st</strong>
                      </li>
                    );
                  })()
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (embedded) {
    return (
      <div
        className="page-surface"
        style={{
          background: surface,
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
          padding: "24px 0 32px",
        }}
      >
        <section id="statistik">
          <header>
            <div>
              <p className="eyebrow">Statistik</p>
              <p className="hint">Vecko- och månadssummor per hushåll</p>
            </div>
          </header>
          {content}
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
        padding: "24px 0 32px",
      }}
    >
      <div className="shell">
        <Link className="back-link" to="/dashboard">
          ← Till dashboard
        </Link>
        <Logo />
        <header>
          <div>
            <p className="eyebrow">Statistik</p>
            <h1>Poäng och balans</h1>
            <p className="hint">Vecko- och månadssummor per hushåll</p>
          </div>
        </header>
        {content}
      </div>
    </div>
  );
};
