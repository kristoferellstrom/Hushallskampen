import { shadeForPoints } from "../../utils/palette";
import type { Entry } from "../../types/calendar";

type Props = { entries: Entry[] };

export const CalendarDots = ({ entries }: Props) => {
  return (
    <div className="dot-row">
      {entries.slice(0, 8).map((en) => {
        const baseColor = en.assignedToUserId?.color;
        const points = en.choreId?.defaultPoints ?? 0;
        const safePoints = Number.isFinite(points) ? points : 0;
        const shade = shadeForPoints(baseColor, safePoints);
        return <span key={en._id} className="dot" style={{ background: shade }} />;
      })}
      {entries.length > 8 && <span className="dot more">+{entries.length - 8}</span>}
    </div>
  );
};
