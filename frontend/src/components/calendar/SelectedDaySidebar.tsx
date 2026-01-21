import { useMemo, useState } from "react";
import type { CalendarEntry } from "../../types/calendar";
import { shadeForPoints, textColorForBackground } from "../../utils/palette";

type Props = {
  selectedDay: string;
  entries: CalendarEntry[];
  loading: boolean;
  myPendingCount: number;
  userColor: string;
  currentUserId?: string | null;

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
  currentUserId,
  isEligible,
  onSubmit,
  onDelete,
  onDragStartEntry,
  onDragEndEntry,
}: Props) => {
  const firstName = (name?: string | null) => (name ? name.split(" ")[0] : "-");
  const [showApproved, setShowApproved] = useState(false);
  const dateBadgeBg = userColor;
  const plannedEntries = useMemo(
    () => entries.filter((e) => e.status !== "approved" && e.status !== "rejected"),
    [entries],
  );
  const approvedEntries = useMemo(() => entries.filter((e) => e.status === "approved"), [entries]);
  const rejectedEntries = useMemo(() => entries.filter((e) => e.status === "rejected"), [entries]);
  const approvedCount = approvedEntries.length;
  const rejectedCount = rejectedEntries.length;
  const totalReviewed = approvedCount + rejectedCount;

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

      <ul className="list compact planned-list">
        {plannedEntries.map((e) => {
          const baseColor = e.assignedToUserId?.color;
          const points = e.choreId?.defaultPoints ?? 0;
          const safePoints = Number.isFinite(points) ? points : 0;
          const shade = shadeForPoints(baseColor, safePoints);
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
              <div className="mini-content">
                <div className="mini-text">
                  <div className="mini-title">
                    <span className="mini-name" style={{ color: textColor }}>
                      {e.choreId?.title || "Syssla"}
                    </span>
                    <span className="mini-points">{safePoints}p</span>
                  </div>
                  <p className="hint mini-assignee" style={{ color: textColor }}>
                    {firstName(e.assignedToUserId.name)}
                    {statusLabel ? ` — ${statusLabel}` : ""}
                  </p>
                </div>

                {isEligible(e) && (
                  <div className="mini-actions">
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
                    {(e.status === "planned" || e.status === "rejected") && (
                      <button
                        type="button"
                        className="tiny-btn ghost"
                        onClick={() => onDelete(e._id)}
                        disabled={loading}
                        aria-label="Ta bort"
                      >
                        Ta bort
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {totalReviewed > 0 && (
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
            {showApproved ? "Dölj granskade" : `Visa granskade (${totalReviewed})`}
          </button>

              {showApproved && (
                <ul className="list compact approved-list" style={{ marginTop: 6 }}>
                  {approvedEntries.map((e) => {
                    const baseColor = e.assignedToUserId?.color;
                    const points = e.choreId?.defaultPoints ?? 0;
                    const safePoints = Number.isFinite(points) ? points : 0;
                    const shade = shadeForPoints(baseColor, safePoints);
                    const textColor = textColorForBackground(shade);
                    return (
                      <li
                        key={e._id}
                        className="mini-item status-approved"
                        style={{ background: shade, color: textColor }}
                      >
                        <div>
                          <strong>{e.choreId?.title || "Syssla"}</strong> · {safePoints}p
                          <p className="hint" style={{ color: textColor, opacity: 0.9 }}>
                            {firstName(e.assignedToUserId.name)}
                          </p>
                        </div>
                      </li>
                    );
                  })}

                  {rejectedEntries.map((e) => {
                    const baseColor = e.assignedToUserId?.color;
                    const points = e.choreId?.defaultPoints ?? 0;
                    const safePoints = Number.isFinite(points) ? points : 0;
                    const shade = shadeForPoints(baseColor, safePoints);
                    const textColor = textColorForBackground(shade);

                    return (
                      <li
                        key={e._id}
                        className="mini-item status-rejected"
                        style={{ background: shade, color: textColor }}
                      >
                        <div className="mini-content">
                          <div className="mini-text">
                            <div className="mini-title">
                              <span className="mini-name" style={{ color: textColor }}>
                                {e.choreId?.title || "Syssla"}
                              </span>
                            </div>
                            <p className="hint" style={{ color: textColor, opacity: 0.9, fontSize: "12px" }}>
                              {firstName(e.assignedToUserId.name)}
                            </p>
                          </div>
                          {isEligible(e) && e.assignedToUserId?._id === currentUserId && (
                            <div
                              className="mini-actions"
                              style={{ width: "100%", justifyContent: "flex-end", marginTop: 18, gap: 12 }}
                            >
                              <button
                                type="button"
                                className="tiny-btn"
                                style={{
                                  background: userColor,
                                  color: textColorForBackground(userColor),
                                  boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                                  fontWeight: 800,
                                }}
                                onClick={() => onSubmit(e._id)}
                                disabled={loading || myPendingCount >= 5}
                              >
                                Gör om
                              </button>
                            </div>
                          )}
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
