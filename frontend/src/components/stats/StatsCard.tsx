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
  figureSrc?: string;
  hidePeriodLabel?: boolean;
  hideTotal?: boolean;
  stackedBalance?: boolean;
  sortByPoints?: boolean;
  footer?: React.ReactNode;
  renderExtra?: (rec: StatItem) => React.ReactNode;
  blockClassName?: string;
};

export const StatsCard = ({
  title,
  items,
  balanceInfo,
  colorMap = {},
  emptyText = "Inga data ännu",
  description,
  controls,
  figureSrc = "/figure/woman_shopping.png",
  hidePeriodLabel = false,
  hideTotal = false,
  stackedBalance = false,
  sortByPoints = false,
  footer,
  renderExtra,
  blockClassName,
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
        <div key={rec.periodStart} className={`stat-block${blockClassName ? ` ${blockClassName}` : ""}`}>
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

          {(() => {
            const total = rec.totalsByUser.reduce((sum, t) => sum + t.points, 0);
            const ordered = sortByPoints
              ? [...rec.totalsByUser].sort((a, b) => b.points - a.points)
              : rec.totalsByUser;
            const segments = ordered.map((t) => {
              const bg = (() => {
                const explicit = t.userId.color || colorMap[t.userId._id];
                if (!explicit) return fallbackColorForUser(t.userId._id);
                const col = explicit.toLowerCase();
                if (col.startsWith("#")) return col;
                const preview = colorPreview(col);
                return preview || fallbackColorForUser(t.userId._id);
              })();
              const pct = total > 0 ? Math.round((t.points / total) * 100) : 0;
              return {
                id: t.userId._id,
                name: t.userId.name,
                points: t.points,
                pct,
                bg,
                fg: textColorForBackground(bg),
              };
            });

            const gradient = (() => {
              if (segments.length === 0 || total === 0) return "#e2e8f0";
              let start = 0;
              return `conic-gradient(${segments
                .map((s) => {
                  const slice = Math.max((s.points / total) * 360, 0);
                  const end = start + slice;
                  const entry = `${s.bg} ${start}deg ${end}deg`;
                  start = end;
                  return entry;
                })
                .join(", ")})`;
            })();

            return (
              <div className="pie-wrap">
                {figureSrc && (
                  <img
                    className="pie-figure"
                    src={figureSrc}
                    alt="Shopping illustration"
                    aria-hidden="true"
                  />
                )}
                <div className="pie" style={{ background: gradient }} aria-label="Poängfördelning"></div>
                <ul className="pie-legend">
                  {segments.map((s) => (
                    <li key={s.id}>
                      <span className="legend-dot" style={{ background: s.bg }} />
                      <div className="legend-text">
                        <span className="legend-name">{s.name}</span>
                        <span className="legend-meta">
                          {s.points}p · {s.pct}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          <div className="balance-wrap">
            <BalanceRow rec={rec} balanceInfo={balanceInfo} stacked={stackedBalance} hideTotal={hideTotal} />
          </div>

          {renderExtra && <div className="stat-extra">{renderExtra(rec)}</div>}
        </div>
      ))}

      {items.length === 0 && <p className="hint">{emptyText}</p>}

      {footer && <div className="stat-footer">{footer}</div>}
    </div>
  );
};
