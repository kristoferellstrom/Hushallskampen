import type { StatItem, BalanceInfo } from "../../hooks/useStats";

type Props = {
  rec: StatItem;
  balanceInfo: (rec: StatItem) => BalanceInfo;
};

export const BalanceRow = ({ rec, balanceInfo }: Props) => {
  const info = balanceInfo(rec);
  const topName = info.top?.userId.name || "-";
  const bottomName = info.bottom?.userId.name || "-";

  return (
    <div className="row" style={{ justifyContent: "space-between", margin: "8px 0" }}>
      <span className="hint">Totalt: {info.totalPoints}p</span>
      <span className="hint">
        Mest: {topName} ({info.top?.pct ? info.top.pct.toFixed(1) : "0"}% av mål{" "}
        {info.top?.target ? info.top.target.toFixed(0) : "0"}%)
      </span>
      <span className="hint">
        Minst: {bottomName} ({info.bottom?.pct ? info.bottom.pct.toFixed(1) : "0"}% av mål{" "}
        {info.bottom?.target ? info.bottom.target.toFixed(0) : "0"}%)
      </span>
    </div>
  );
};
