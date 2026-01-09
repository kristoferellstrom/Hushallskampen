import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMonthlyStats, fetchWeeklyStats } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

type StatItem = { periodStart: string; periodEnd: string; totalsByUser: Array<{ userId: { _id: string; name: string }; points: number }> };
type Props = { embedded?: boolean };

export const StatsPage = ({ embedded = false }: Props) => {
  const { token } = useAuth();
  const [weekly, setWeekly] = useState<StatItem[]>([]);
  const [monthly, setMonthly] = useState<StatItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setError("");
      try {
        const [w, m] = await Promise.all([fetchWeeklyStats(token), fetchMonthlyStats(token)]);
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
              <ul className="list">
                {rec.totalsByUser.map((t) => (
                  <li key={t.userId._id} className="row">
                    <span>{t.userId.name}</span>
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
              <ul className="list">
                {rec.totalsByUser.map((t) => (
                  <li key={t.userId._id} className="row">
                    <span>{t.userId.name}</span>
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
