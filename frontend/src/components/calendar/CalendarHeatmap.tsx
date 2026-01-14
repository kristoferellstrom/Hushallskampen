import type { HeatDay } from "../../types/calendar";
import { shadeForPoints } from "../../utils/palette";

type Props = { data: HeatDay[]; userColor: string };

function mixHex(hexA: string, hexB: string, t: number) {
  const parse = (h: string) => {
    const s = h.replace("#", "");
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
    };
  };
  const a = parse(hexA);
  const b = parse(hexB);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(a.r, b.r))}${toHex(mix(a.g, b.g))}${toHex(mix(a.b, b.b))}`;
}

function shadeBucket(color: string, bucket: number) {
  // 1 = light, 10 = dark
  if (color.startsWith("#")) {
    const darkBase = color;
    const t = bucket / 10; // 0.1..1
    return mixHex("#f8fafc", darkBase, t);
  }
  return shadeForPoints(color, bucket);
}

export const CalendarHeatmap = ({ data, userColor }: Props) => {
  return (
    <div className="heatmap-grid">
      {data.map((d) => {
        const dayNum = Number(d.date.slice(-2));

        if (!d.inMonth) {
          return <div key={d.date} className="heatmap-cell muted" aria-hidden="true"></div>;
        }
        if (d.points === 0) {
          return (
            <div key={d.date} className="heatmap-cell muted" aria-hidden="true">
              <span>{dayNum}</span>
            </div>
          );
        }

        // Map total points to bucket 1–10; 10+ is darkest.
        const bucket = Math.min(10, Math.max(1, Math.ceil(d.points / 2)));
        const bg = shadeBucket(userColor, bucket);

        return (
          <div
            key={d.date}
            className="heatmap-cell"
            title={`${d.date} • ${d.count} uppgifter • ${d.points}p`}
            style={{ background: bg }}
          >
            <span>{dayNum}</span>
          </div>
        );
      })}
    </div>
  );
};
