import type { HeatDay } from "../../types/calendar";

type Props = { data: HeatDay[] };

export const CalendarHeatmap = ({ data }: Props) => {
  return (
    <div className="heatmap-grid">
      {data.map((d) => {
        const intensity = Math.min(1, d.count / 5 || d.points / 15);
        const bg = `rgba(15, 23, 42, ${0.08 + intensity * 0.35})`;

        return (
          <div
            key={d.date}
            className={`heatmap-cell ${d.inMonth ? "" : "muted"}`}
            title={`${d.date} • ${d.count} uppgifter • ${d.points}p`}
            style={{ background: bg }}
          >
            <span>{Number(d.date.slice(-2))}</span>
          </div>
        );
      })}
    </div>
  );
};
