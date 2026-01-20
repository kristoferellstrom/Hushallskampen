import type { StatItem } from "../../hooks/useStats";
import type { BalanceInfo } from "../../hooks/useStats";
import { BalanceRow } from "./BalanceRow";
import { colorPreview, textColorForBackground, fallbackColorForUser } from "../../utils/palette";

type Props = {
  title: string;
  items: StatItem[];
  balanceInfo: (rec: StatItem) => BalanceInfo;
  emptyText?: string;
  colorMap?: Record<string, string>;
};

export const StatsCard = ({ title, items, balanceInfo, colorMap = {}, emptyText = "Inga data ännu" }: Props) => {
  return (
    <div className="card stats-card">
      <div className="stats-head">
        <h2>{title}</h2>
      </div>

      {items.map((rec) => (
        <div key={rec.periodStart} className="stat-block">
          <p className="hint period-label">
            {rec.periodStart.slice(0, 10)} – {rec.periodEnd.slice(0, 10)}
          </p>

          <BalanceRow rec={rec} balanceInfo={balanceInfo} />

          {(() => {
            const total = rec.totalsByUser.reduce((sum, t) => sum + t.points, 0);
            return (
              <div className="pill total-pill">
                Totalt {total}p
              </div>
            );
          })()}

          <ul className="list">
            {rec.totalsByUser.map((t) => {
              const bg = (() => {
                const explicit = t.userId.color || colorMap[t.userId._id];
                if (!explicit) return fallbackColorForUser(t.userId._id);
                const col = explicit.toLowerCase();
                if (col.startsWith("#")) return col;
                const preview = colorPreview(col);
                return preview || fallbackColorForUser(t.userId._id);
              })();
              const fg = textColorForBackground(bg);
              const total = rec.totalsByUser.reduce((sum, u) => sum + u.points, 0);
              const pct = total > 0 ? Math.round((t.points / total) * 100) : 0;

              return (
                <li key={t.userId._id} className="row user-row" style={{ background: bg, color: fg }}>
                  <span className="user-dot" style={{ background: fg }} />
                  <div className="user-text">
                    <span className="user-name">{t.userId.name}</span>
                    <span className="user-meta">{pct}% av totalen</span>
                  </div>
                  <strong className="user-points">{t.points}p</strong>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {items.length === 0 && <p className="hint">{emptyText}</p>}
    </div>
  );
};
