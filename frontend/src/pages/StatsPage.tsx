import { Link } from "react-router-dom";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { useStats } from "../hooks/useStats";
import { StatsCard } from "../components/stats/StatsCard";
import { useApprovalsPage } from "../hooks/useApprovalsPage";
import { colorPreview, fallbackColorForUser, shadeForPoints } from "../utils/palette";

type Props = { embedded?: boolean };

export const StatsPage = ({ embedded = false }: Props) => {
  const { token, user } = useAuth();
  const { weekly, monthly, error, balanceInfo, memberColors } = useStats(token);
  const { monthlyChoreLeaders, yearChoreLeaders, yearChoreTotals } = useApprovalsPage(200);
  const [weekIdx, setWeekIdx] = useState(0);
  const [monthIdx, setMonthIdx] = useState(0);
  const currentYear = new Date().getFullYear();
  const [choreRange, setChoreRange] = useState<"30d" | "year">("30d");

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
    const segments = yearChoreSlices.map((c) => {
      const base = colorPreview(fallbackColorForUser(c.chore)) || fallbackColorForUser(c.chore);
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
          title="Veckosummering"
          description="Summerar poäng per hushållsmedlem för aktuell vecka. Bläddra för tidigare veckor för att se hur fördelningen förändras och om hushållet närmar sig era mål över tid."
          items={weekSlice}
          balanceInfo={balanceInfo}
          colorMap={memberColors}
          hidePeriodLabel
          hideTotal
          stackedBalance
          sortByPoints
          figureSrc="/figure/woman_shopping.png"
          blockClassName="flat weekly-shift"
          controls={{
            onPrev: () => setWeekIdx((i) => Math.min(i + 1, weekly.length - 1)),
            onNext: () => setWeekIdx((i) => Math.max(i - 1, 0)),
            canPrev: weekIdx < weekly.length - 1,
            canNext: weekIdx > 0,
            label: weekSlice[0]
              ? `${weekSlice[0].periodStart.slice(0, 10)} – ${weekSlice[0].periodEnd.slice(0, 10)}`
              : "Ingen data",
          }}
        />
        <StatsCard
          title="Månadssummering"
          description="Visar varje medlems poäng och andel för aktuell månad. Bläddra bakåt för att se hur fördelningen ändras månad för månad och om hushållet håller jämna steg med era mål."
          items={monthSlice}
          balanceInfo={balanceInfo}
          colorMap={memberColors}
          hidePeriodLabel
          hideTotal
          stackedBalance
          sortByPoints
          figureSrc="/figure/man_washing.png"
          blockClassName="flat monthly-shift"
          controls={{
            onPrev: () => setMonthIdx((i) => Math.min(i + 1, monthly.length - 1)),
            onNext: () => setMonthIdx((i) => Math.max(i - 1, 0)),
            canPrev: monthIdx < monthly.length - 1,
            canNext: monthIdx > 0,
            label: monthSlice[0]
              ? `${monthSlice[0].periodStart.slice(0, 10)} – ${monthSlice[0].periodEnd.slice(0, 10)}`
              : "Ingen data",
          }}
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
          blockClassName="year-shift"
          controls={{
            label: `${currentYear}`,
            canPrev: false,
            canNext: false,
          }}
          footer={
            <div className="year-extras">
              <div className="stat-block figure-block">
                <img
                  src="/figure/stats.png"
                  alt="Statistikillustration"
                  loading="lazy"
                  className="stat-figure-wide"
                />
              </div>
              <div className="stat-block">
                <div className="subhead">
                  <h3>Årets mest gjorda sysslor</h3>
                  <p className="stat-desc">
                    Vilka sysslor har gjorts flest gånger i år? Tårtdiagrammet visar fördelningen mellan toppsysslorna.
                  </p>
                </div>
                {yearChorePie.segments.length === 0 ? (
                  <p className="hint">Ingen data för året ännu.</p>
                ) : (
                  <div className="pie-wrap chore-pie">
                    <div
                      className="pie"
                      style={{ background: yearChorePie.gradient }}
                      aria-label="Fördelning av sysslor under året"
                    />
                    <ul className="pie-legend two-col">
                      {yearChorePie.segments.map((s) => (
                        <li key={s.chore}>
                          <span className="legend-dot" style={{ background: s.color }} />
                          <div className="legend-text">
                            <span className="legend-name">{s.chore}</span>
                            <span className="legend-meta">
                              {s.count} st · {s.pct}%
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          }
        />
        {choreLeaders.length > 0 && (
          <div className="card stats-card">
            <div className="stats-head">
              <h2>Vem har gjort mest?</h2>
              <p className="stat-desc">
                Se vem som gjort flest av varje syssla. Växla mellan senaste 30 dagarna och året för att följa trender.
              </p>
              <div className="stat-controls mode-toggle">
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
              {choreLeaders.length === 0 ? (
                <p className="hint">Ingen data ännu.</p>
              ) : (
                <div className="chore-chip-grid">
                  {choreLeaders.map((row) => {
                    const base = memberColors[row.userId] || row.userId || "";
                    const strong = colorPreview(base) || base || fallbackColorForUser(row.userId || "");
                    const widthPct = maxChoreCount ? Math.round((row.count / maxChoreCount) * 100) : 0;
                    return (
                      <div
                        key={`${row.chore}-${choreRange}`}
                        className="chore-chip"
                        style={{ "--chore-color": strong } as CSSProperties}
                      >
                        <div className="chore-chip-top">
                          <span className="chip-dot" />
                          <span className="user-name">{row.chore}</span>
                          <span className="chore-count">{row.count} st</span>
                        </div>
                        <span className="user-meta">Flest av: {row.user}</span>
                        <div className="chore-chip-bar">
                          <div className="chore-chip-fill" style={{ width: `${widthPct}%` }} />
                        </div>
                      </div>
                      );
                    })}
                </div>
              )}
              <div className="chore-figure">
                <img
                  src="/figure/aret_runt.png"
                  alt="Året runt illustration"
                  loading="lazy"
                  className="stat-figure-wide"
                />
                <p className="hint">
                  Statistiken här ger en tydlig bild av hur hushållets sysslor har fördelats och utvecklats över året.
                  Du kan se vem som samlat flest poäng totalt, hur stor andel varje medlem bidrar med och vem som ligger
                  närmast (eller längst ifrån) sitt mål. Listan över årets mest gjorda sysslor visar vilka uppgifter som
                  återkommer mest i vardagen, och vem som oftast tar ansvar för dem. Genom att växla mellan senaste 30
                  dagar och hela året kan du jämföra kortsiktiga förändringar med långsiktiga mönster - vilket gör det
                  lättare att upptäcka obalans, följa trender och justera mål eller fördelning inför nästa år.
                </p>
              </div>
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
        {content}
      </div>
    </div>
  );
};
