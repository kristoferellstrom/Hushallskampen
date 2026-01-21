import type { StatItem, BalanceInfo } from "../../hooks/useStats";

type Props = {
  rec: StatItem;
  balanceInfo: (rec: StatItem) => BalanceInfo;
  stacked?: boolean;
  hideTotal?: boolean;
};

export const BalanceRow = ({ rec, balanceInfo, stacked = false, hideTotal = false }: Props) => {
  const info = balanceInfo(rec);
  const topName = info.top?.userId.name || "-";
  const bottomName = info.bottom?.userId.name || "-";
  const topText = `Mest: ${topName} (${info.top?.pct ? info.top.pct.toFixed(1) : "0"}% av mål ${
    info.top?.target ? info.top.target.toFixed(0) : "0"
  }%)`;
  const bottomText = `Minst: ${bottomName} (${info.bottom?.pct ? info.bottom.pct.toFixed(1) : "0"}% av mål ${
    info.bottom?.target ? info.bottom.target.toFixed(0) : "0"
  }%)`;

  if (stacked) {
    return (
      <div className="column" style={{ gap: 6, margin: "12px 0 4px" }}>
        <span className="hint" style={{ display: "block" }}>{topText}</span>
        <span className="hint" style={{ display: "block" }}>{bottomText}</span>
      </div>
    );
  }
  return (
    <div className="row" style={{ justifyContent: "space-between", margin: "8px 0" }}>
      {!hideTotal && <span className="hint">Totalt: {info.totalPoints}p</span>}
      <span className="hint">{topText}</span>
      <span className="hint">{bottomText}</span>
    </div>
  );
};
