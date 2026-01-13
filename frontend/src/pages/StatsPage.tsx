import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { useStats } from "../hooks/useStats";
import { StatsCard } from "../components/stats/StatsCard";

type Props = { embedded?: boolean };

export const StatsPage = ({ embedded = false }: Props) => {
  const { token } = useAuth();
  const { weekly, monthly, error, balanceInfo, memberColors } = useStats(token);

  const content = (
    <>
      {error && <p className="status error">{error}</p>}

      <div className="grid">
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
