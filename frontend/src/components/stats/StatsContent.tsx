import type { CSSProperties } from "react";
import { StatsCard } from "./StatsCard";
import { buildWebpSrcSet, withWebpWidth } from "../../utils/imageUtils";
import { colorPreview, fallbackColorForUser } from "../../utils/palette";

type Leader = { name: string; points: number } | null;

type ChoreLeader = { chore: string; user: string; userId: string; count: number };

type YearChoreSegment = {
  chore: string;
  color: string;
  count: number;
  pct: number;
  start: number;
  end: number;
};

type YearChorePie = {
  segments: YearChoreSegment[];
  gradient: string;
  total: number;
};

type Controls = {
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  label: string;
};

type StatsContentProps = {
  error?: string;
  showPoints: boolean;
  weeklyLeader: Leader;
  monthlyLeader: Leader;
  yearlyLeader: Leader;
  weekSlice: any[];
  monthSlice: any[];
  yearAggregate: any[];
  balanceInfo: any;
  memberColors: Record<string, string>;
  weekControls: Controls;
  monthControls: Controls;
  currentYear: number;
  yearChorePie: YearChorePie;
  choreLeaders: ChoreLeader[];
  choreRange: "30d" | "year";
  setChoreRange: (range: "30d" | "year") => void;
  maxChoreCount: number;
};

export const StatsContent = ({
  error,
  showPoints,
  weeklyLeader,
  monthlyLeader,
  yearlyLeader,
  weekSlice,
  monthSlice,
  yearAggregate,
  balanceInfo,
  memberColors,
  weekControls,
  monthControls,
  currentYear,
  yearChorePie,
  choreLeaders,
  choreRange,
  setChoreRange,
  maxChoreCount,
}: StatsContentProps) => {
  return (
    <>
      {error && <p className="status error">{error}</p>}

      {showPoints && (
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
      )}

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
          figureSrc="/figure/woman_shopping.webp"
          blockClassName="flat weekly-shift"
          hidePoints={!showPoints}
          controls={weekControls}
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
          figureSrc="/figure/man_washing.webp"
          blockClassName="flat monthly-shift"
          hidePoints={!showPoints}
          controls={monthControls}
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
          hidePoints={!showPoints}
          controls={{
            label: `${currentYear}`,
            canPrev: false,
            canNext: false,
          }}
          footer={
            <div className="year-extras">
              <div className="stat-block figure-block">
                <img
                  src={withWebpWidth("/figure/stats.webp", 800)}
                  srcSet={buildWebpSrcSet("/figure/stats.webp", [400, 800], 1200)}
                  sizes="(max-width: 900px) 100vw, 560px"
                  alt="Statistikillustration"
                  loading="lazy"
                  className="stat-figure-wide"
                  decoding="async"
                  width="1200"
                  height="800"
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
                <div className={`chore-chip-grid ${choreLeaders.length > 8 ? "scrollable" : ""}`}>
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
                  src={withWebpWidth("/figure/aret_runt.webp", 800)}
                  srcSet={buildWebpSrcSet("/figure/aret_runt.webp", [400, 800], 1200)}
                  sizes="140px"
                  alt="Året runt illustration"
                  loading="lazy"
                  className="stat-figure-compact"
                  style={{ width: "240px", maxWidth: "240px", height: "auto" }}
                  decoding="async"
                  width="240"
                  height="160"
                />
                <p className="hint">
                  {showPoints
                    ? `Statistiken här ger en tydlig bild av hur hushållets sysslor har fördelats och utvecklats över året.
                  Du kan se vem som samlat flest poäng totalt, hur stor andel varje medlem bidrar med och vem som ligger
                  närmast (eller längst ifrån) sitt mål. Listan över årets mest gjorda sysslor visar vilka uppgifter som
                  återkommer mest i vardagen, och vem som oftast tar ansvar för dem. Genom att växla mellan senaste 30
                  dagar och hela året kan du jämföra kortsiktiga förändringar med långsiktiga mönster - vilket gör det
                  lättare att upptäcka obalans, följa trender och justera mål eller fördelning inför nästa år.`
                    : `Statistiken här ger en tydlig bild av hur hushållets sysslor har fördelats och utvecklats över året.
                  Du kan se hur stor andel (%) varje medlem står för, vem som bidrar mest totalt och vem som ligger
                  närmast (eller längst ifrån) sin målnivå. Listan över årets mest gjorda sysslor visar vilka uppgifter
                  som återkommer mest i vardagen, hur de fördelar sig mellan olika sysslor och vem som oftast tar ansvar
                  för dem. Genom att växla mellan senaste 30 dagar och hela året kan du jämföra kortsiktiga förändringar
                  med långsiktiga mönster - vilket gör det lättare att upptäcka obalans, följa trender och justera mål
                  eller fördelning inför nästa år.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
