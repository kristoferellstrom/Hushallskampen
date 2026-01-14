import type { CalendarEntry } from "../../types/calendar";
import { shadeForPoints, textColorForBackground } from "../../utils/palette";

type Props = {
  selectedDay: string;
  entries: CalendarEntry[];
  loading: boolean;
  myPendingCount: number;
  userColor: string;

  isEligible: (e: CalendarEntry) => boolean;

  onSubmit: (id: string) => void;
  onDelete: (id: string) => void;

  onDragStartEntry: (entryId: string, ev: React.DragEvent<HTMLLIElement>) => void;
  onDragEndEntry: () => void;
};

export const SelectedDaySidebar = ({
  selectedDay,
  entries,
  loading,
  myPendingCount,
  userColor,
  isEligible,
  onSubmit,
  onDelete,
  onDragStartEntry,
  onDragEndEntry,
}: Props) => {
  const dateBadgeBg = userColor;
  return (
    <div className="card sidebar right">
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <span
          className="pill light"
          style={{
            background: dateBadgeBg,
            color: textColorForBackground(dateBadgeBg),
            border: "none",
          }}
        >
          {selectedDay}
        </span>
      </div>

      {entries.length === 0 && <p className="hint">Inga åtaganden denna dag.</p>}

      <ul className="list compact">
        {entries.map((e) => {
          const shade = shadeForPoints(e.assignedToUserId.color, e.choreId.defaultPoints);
          const textColor = textColorForBackground(shade);

          return (
            <li
              key={e._id}
              className="mini-item"
              style={{ background: shade, color: textColor }}
              draggable={isEligible(e)}
              onDragStart={(ev) => onDragStartEntry(e._id, ev)}
              onDragEnd={onDragEndEntry}
            >
              <div>
                <strong>{e.choreId.title}</strong> · {e.choreId.defaultPoints}p
                <p className="hint" style={{ color: textColor, opacity: 0.9 }}>
                  {e.assignedToUserId.name} — {e.status === "rejected" ? "avvisad, gör om" : e.status}
                </p>
              </div>

              <div className="actions">
                {isEligible(e) && (
                  <button type="button" onClick={() => onSubmit(e._id)} disabled={loading || myPendingCount >= 5}>
                    {e.status === "rejected" ? "Markera igen" : "Klar"}
                  </button>
                )}

                {(e.status === "planned" || e.status === "rejected") && (
                  <button
                    type="button"
                    className="icon-btn corner-btn"
                    aria-label="Ta bort"
                    onClick={() => onDelete(e._id)}
                    disabled={loading}
                  >
                    🗑
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
