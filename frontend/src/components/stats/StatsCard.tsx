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
  description?: string;
  controls?: {
    onPrev?: () => void;
    onNext?: () => void;
    canPrev?: boolean;
    canNext?: boolean;
    label?: string;
  };
  listClassName?: string;
  hidePeriodLabel?: boolean;
  hideTotal?: boolean;
  stackedBalance?: boolean;
  sortByPoints?: boolean;
  footer?: React.ReactNode;
};

export const StatsCard = ({
  title,
  items,
  balanceInfo,
  colorMap = {},
  emptyText = "Inga data ännu",
  description,
  controls,
  listClassName,
  hidePeriodLabel = false,
  hideTotal = false,
  stackedBalance = false,
  sortByPoints = false,
  footer,
}: Props) => {
  return (
    <div className="card stats-card">
      <div className="stats-head">
        <div className="stats-head-left">
          <h2>{title}</h2>
          {description && <p className="stat-desc">{description}</p>}
        </div>
      </div>

      {items.map((rec) => (
        <div key={rec.periodStart} className="stat-block">
          {!hidePeriodLabel && (
            <p className="hint period-label">
              {rec.periodStart.slice(0, 10)} – {rec.periodEnd.slice(0, 10)}
            </p>
          )}

          {controls && (
            <div className="stat-controls block-controls">
              <button
                className="stat-nav-btn"
                onClick={controls.onPrev}
                disabled={!controls.canPrev}
                aria-label="Föregående"
              >
                ←
              </button>
              <span className="stat-label">{controls.label}</span>
              <button
                className="stat-nav-btn"
                onClick={controls.onNext}
                disabled={!controls.canNext}
                aria-label="Nästa"
              >
                →
              </button>
            </div>
          )}

          {!hideTotal && (() => {
            const total = rec.totalsByUser.reduce((sum, t) => sum + t.points, 0);
            return (
              <div className="pill total-pill">
                Totalt {total}p
              </div>
            );
          })()}

          <ul className={`list ${listClassName || ""}`}>
            {(sortByPoints
              ? [...rec.totalsByUser].sort((a, b) => b.points - a.points)
              : rec.totalsByUser
            ).map((t) => {
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

          <BalanceRow rec={rec} balanceInfo={balanceInfo} stacked={stackedBalance} hideTotal={hideTotal} />
        </div>
      ))}

      {items.length === 0 && <p className="hint">{emptyText}</p>}

      {footer && <div className="stat-footer">{footer}</div>}
    </div>
  );
};
