import type { StatItem } from "../../hooks/useStats";
import type { BalanceInfo } from "../../hooks/useStats";
import { BalanceRow } from "./BalanceRow";

type Props = {
  title: string;
  items: StatItem[];
  balanceInfo: (rec: StatItem) => BalanceInfo;
  emptyText?: string;
};

export const StatsCard = ({ title, items, balanceInfo, emptyText = "Inga data ännu" }: Props) => {
  return (
    <div className="card">
      <h2>{title}</h2>

      {items.map((rec) => (
        <div key={rec.periodStart} className="stat-block">
          <p className="hint">
            {rec.periodStart.slice(0, 10)} – {rec.periodEnd.slice(0, 10)}
          </p>

          <BalanceRow rec={rec} balanceInfo={balanceInfo} />

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

      {items.length === 0 && <p className="hint">{emptyText}</p>}
    </div>
  );
};
