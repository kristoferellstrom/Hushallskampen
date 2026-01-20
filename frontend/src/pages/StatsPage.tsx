import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { useStats } from "../hooks/useStats";
import { StatsCard } from "../components/stats/StatsCard";

type Props = { embedded?: boolean };

export const StatsPage = ({ embedded = false }: Props) => {
  const { token } = useAuth();
  const { weekly, monthly, error, balanceInfo, memberColors } = useStats(token);

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
        const id = t.userId?._id || t.userId;
        if (!map[id]) map[id] = { name: t.userId?.name || "-", points: 0 };
        map[id].points += t.points;
      }),
    );
    const all = Object.values(map).sort((a, b) => b.points - a.points);
    return all[0] || null;
  })();

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
        <StatsCard title="Veckosummeringar" items={weekly} balanceInfo={balanceInfo} colorMap={memberColors} />
        <StatsCard title="Månads-summeringar" items={monthly} balanceInfo={balanceInfo} colorMap={memberColors} />
      </div>
    </>
  );

  if (embedded) {
    return (
      <section id="statistik">
        <header>
          <div>
            <p className="eyebrow">Statistik</p>
            <h2>Poäng och balans</h2>
            <p className="hint">Vecko- och månadssummor per hushåll</p>
          </div>
        </header>
        {content}
      </section>
    );
  }

  return (
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
  );
};
