import { useMemo, useState } from "react";
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
  const [showApproved, setShowApproved] = useState(false);
  const dateBadgeBg = userColor;
  const plannedEntries = useMemo(() => entries.filter((e) => e.status !== "approved"), [entries]);
  const approvedEntries = useMemo(() => entries.filter((e) => e.status === "approved"), [entries]);
  const approvedCount = approvedEntries.length;

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

      {plannedEntries.length === 0 && <p className="hint">Inga åtaganden denna dag.</p>}

      <ul className="list compact">
        {plannedEntries.map((e) => {
          const shade = shadeForPoints(e.assignedToUserId.color, e.choreId.defaultPoints);
          const textColor = textColorForBackground(shade);
          const statusLabel = e.status === "rejected" ? "Avvisad – gör om" : "";

          return (
            <li
              key={e._id}
              className={`mini-item ${e.status === "approved" ? "status-approved" : ""} ${
                e.status === "rejected" ? "status-rejected" : ""
              }`}
              style={{ background: shade, color: textColor }}
              draggable={isEligible(e)}
              onDragStart={(ev) => onDragStartEntry(e._id, ev)}
              onDragEnd={onDragEndEntry}
            >
              <div>
                <strong>{e.choreId.title}</strong> · {e.choreId.defaultPoints}p
                <p className="hint" style={{ color: textColor, opacity: 0.9 }}>
                  {e.assignedToUserId.name}
                  {statusLabel ? ` — ${statusLabel}` : ""}
                </p>
              </div>

              <div className="actions">
                {isEligible(e) && (
                  <button
                    type="button"
                    className="tiny-btn"
                    style={{
                      background: userColor,
                      color: textColorForBackground(userColor),
                    }}
                    onClick={() => onSubmit(e._id)}
                    disabled={loading || myPendingCount >= 5}
                  >
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

      {approvedCount > 0 && (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            className="pill light"
            style={{
              background: userColor,
              color: textColorForBackground(userColor),
              border: "none",
            }}
            onClick={() => setShowApproved((v) => !v)}
          >
            {showApproved ? "Dölj klara" : `Visa klara (${approvedCount})`}
          </button>

              {showApproved && (
                <ul className="list compact" style={{ marginTop: 6 }}>
                  {approvedEntries.map((e) => {
                    const shade = shadeForPoints(e.assignedToUserId.color, e.choreId.defaultPoints);
                    const textColor = textColorForBackground(shade);
                    return (
                      <li
                        key={e._id}
                        className="mini-item status-approved"
                        style={{ background: shade, color: textColor }}
                      >
                    <div>
                      <strong>{e.choreId.title}</strong> · {e.choreId.defaultPoints}p
                      <p className="hint" style={{ color: textColor, opacity: 0.9 }}>
                        {e.assignedToUserId.name}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
