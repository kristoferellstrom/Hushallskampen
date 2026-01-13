import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMonthlyStats, fetchWeeklyStats, getHousehold } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

type StatItem = { periodStart: string; periodEnd: string; totalsByUser: Array<{ userId: { _id: string; name: string }; points: number }> };
type Props = { embedded?: boolean };

export const StatsPage = ({ embedded = false }: Props) => {
  const { token } = useAuth();
  const [weekly, setWeekly] = useState<StatItem[]>([]);
  const [monthly, setMonthly] = useState<StatItem[]>([]);
  const [error, setError] = useState("");
  const [targets, setTargets] = useState<Record<string, number>>({});

  const balanceInfo = (rec: StatItem) => {
    const totalPoints = rec.totalsByUser.reduce((sum, t) => sum + t.points, 0);
    const members = rec.totalsByUser.length || 1;
    const targetShare = 100 / members;
    const deltas = rec.totalsByUser.map((t) => {
      const pct = totalPoints > 0 ? (t.points / totalPoints) * 100 : 0;
      const target = targets[t.userId._id] !== undefined ? targets[t.userId._id] : targetShare;
      return { ...t, pct, target, diff: pct - target };
    });
    const sorted = [...deltas].sort((a, b) => b.pct - a.pct);
    return { deltas, top: sorted[0], bottom: sorted[sorted.length - 1], totalPoints };
  };

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setError("");
      try {
        const [w, m, h] = await Promise.all([fetchWeeklyStats(token), fetchMonthlyStats(token), getHousehold(token)]);
        if (h.household?.targetShares) {
          const map: Record<string, number> = {};
          h.household.targetShares.forEach((t) => (map[t.userId] = t.targetPct));
          setTargets(map);
        } else {
          setTargets({});
        }
        setWeekly(w.totals);
        setMonthly(m.totals);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte hämta stats");
      }
    };
    load();
  }, [token]);

  const content = (
    <>
      {error && <p className="status error">{error}</p>}

      <div className="grid">
        <div className="card">
          <h2>Veckosummeringar</h2>
          {weekly.map((rec) => (
            <div key={rec.periodStart} className="stat-block">
              <p className="hint">
                {rec.periodStart.slice(0, 10)} – {rec.periodEnd.slice(0, 10)}
              </p>
              <BalanceRow rec={rec} balanceInfo={balanceInfo} />
              <ul className="list">
                {rec.totalsByUser.map((t) => (
                  <li key={t.userId._id} className="row">
                    <span>
                      {t.userId.name}
                    </span>
                    <strong>{t.points}p</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {weekly.length === 0 && <p className="hint">Inga data ännu</p>}
        </div>

        <div className="card">
          <h2>Månads-summeringar</h2>
          {monthly.map((rec) => (
            <div key={rec.periodStart} className="stat-block">
              <p className="hint">
                {rec.periodStart.slice(0, 10)} – {rec.periodEnd.slice(0, 10)}
              </p>
              <BalanceRow rec={rec} balanceInfo={balanceInfo} />
              <ul className="list">
                {rec.totalsByUser.map((t) => (
                  <li key={t.userId._id} className="row">
                    <span>
                      {t.userId.name}
                    </span>
                    <strong>{t.points}p</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {monthly.length === 0 && <p className="hint">Inga data ännu</p>}
        </div>
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

const BalanceRow = ({ rec, balanceInfo }: { rec: StatItem; balanceInfo: (rec: StatItem) => any }) => {
  const info = balanceInfo(rec);
  const topName = info.top?.userId.name || "-";
  const bottomName = info.bottom?.userId.name || "-";
  return (
    <div className="row" style={{ justifyContent: "space-between", margin: "8px 0" }}>
      <span className="hint">Totalt: {info.totalPoints}p</span>
      <span className="hint">
        Mest: {topName} ({info.top?.pct ? info.top.pct.toFixed(1) : "0"}% av mål {info.top?.target ? info.top.target.toFixed(0) : "0"}%)
      </span>
      <span className="hint">
        Minst: {bottomName} ({info.bottom?.pct ? info.bottom.pct.toFixed(1) : "0"}% av mål {info.bottom?.target ? info.bottom.target.toFixed(0) : "0"}%)
      </span>
    </div>
  );
};
