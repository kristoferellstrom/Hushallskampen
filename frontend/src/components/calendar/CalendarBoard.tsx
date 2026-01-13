import { shadeForPoints } from "../../utils/palette";

type Entry = {
  _id: string;
  status: string;
  date: string;
  assignedToUserId: { _id: string; name: string; color?: string };
  choreId: { _id: string; title: string; defaultPoints: number };
};

type Member = { _id: string; name: string; color?: string };

type MonthDay = { date: string; inMonth: boolean };
type WeekDay = { date: string };
type HeatDay = { date: string; inMonth: boolean; count: number; points: number };

type Props = {
  monthLabel: string;
  loading: boolean;

  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;

  members: Member[];
  filter: string;
  onChangeFilter: (v: string) => void;

  view: "month" | "week";
  onChangeView: (v: "month" | "week") => void;

  showHeatmap: boolean;
  onToggleHeatmap: () => void;

  onCopyLastWeek: () => void;

  selectedDay: string;
  onSelectDay: (day: string) => void;

  monthGrid: MonthDay[];
  weekGrid: WeekDay[];
  entriesByDay: Record<string, Entry[]>;
  heatmapData: HeatDay[];

  dragOverDay: string | null;
  onDragOverDay: (day: string) => void;
  onDragLeaveDay: () => void;

  onDropDay: (day: string, payload: { entryId?: string; choreId?: string }) => void;
};

export const CalendarBoard = ({
  monthLabel,
  loading,
  onPrevMonth,
  onNextMonth,
  members,
  filter,
  onChangeFilter,
  view,
  onChangeView,
  showHeatmap,
  onToggleHeatmap,
  onCopyLastWeek,
  selectedDay,
  onSelectDay,
  monthGrid,
  weekGrid,
  entriesByDay,
  heatmapData,
  dragOverDay,
  onDragOverDay,
  onDragLeaveDay,
  onDropDay,
}: Props) => {
  const weekdays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: string) => {
    e.preventDefault();
    const entryId = e.dataTransfer.getData("entry-id") || undefined;
    const choreId = e.dataTransfer.getData("text/plain") || undefined;
    onDropDay(day, { entryId, choreId });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, day: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    onDragOverDay(day);
  };

  return (
    <div className="card calendar-card">
      <div className="month-nav">
        <button type="button" onClick={onPrevMonth}>
          ←
        </button>

        <div>
          <strong>{monthLabel}</strong>
        </div>

        <button type="button" onClick={onNextMonth}>
          →
        </button>

        <button type="button" className="chip" onClick={onCopyLastWeek} disabled={loading} style={{ marginLeft: 8 }}>
          Kopiera förra veckan
        </button>
      </div>

      <div className="row" style={{ marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Filter
          <select value={filter} onChange={(e) => onChangeFilter(e.target.value)}>
            <option value="all">Alla</option>
            <option value="submitted">Väntar godkännande</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <div className="mode-toggle" style={{ marginLeft: "auto" }}>
          <button type="button" className={view === "month" ? "active" : ""} onClick={() => onChangeView("month")}>
            Månad
          </button>
          <button type="button" className={view === "week" ? "active" : ""} onClick={() => onChangeView("week")}>
            Vecka
          </button>
        </div>

        <button type="button" className="chip" onClick={onToggleHeatmap}>
          {showHeatmap ? "Dölj heatmap" : "Visa heatmap"}
        </button>
      </div>

      <div className="weekdays">
        {weekdays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {view === "month" ? (
        <>
          <div className="month-grid">
            {monthGrid.map((day) => {
              const dayEntries = entriesByDay[day.date] || [];
              const dayNumber = Number(day.date.slice(-2));

              return (
                <div
                  key={day.date}
                  className={`day-cell ${day.inMonth ? "" : "muted"} ${selectedDay === day.date ? "selected" : ""} ${
                    dragOverDay === day.date ? "drag-over" : ""
                  }`}
                  onClick={() => onSelectDay(day.date)}
                  onDragOver={(e) => handleDragOver(e, day.date)}
                  onDragLeave={onDragLeaveDay}
                  onDrop={(e) => handleDrop(e, day.date)}
                >
                  <div className="day-number">{dayNumber}</div>
                  <div className="dot-row">
                    {dayEntries.slice(0, 8).map((en) => {
                      const shade = shadeForPoints(en.assignedToUserId.color, en.choreId.defaultPoints);
                      return <span key={en._id} className="dot" style={{ background: shade }} />;
                    })}
                    {dayEntries.length > 8 && <span className="dot more">+{dayEntries.length - 8}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {showHeatmap && (
            <div className="heatmap-grid">
              {heatmapData.map((d) => {
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
          )}
        </>
      ) : (
        <div className="week-grid">
          {weekGrid.map((day) => {
            const dayEntries = entriesByDay[day.date] || [];
            const dayNumber = Number(day.date.slice(-2));

            return (
              <div
                key={day.date}
                className={`day-cell ${selectedDay === day.date ? "selected" : ""} ${dragOverDay === day.date ? "drag-over" : ""}`}
                onClick={() => onSelectDay(day.date)}
                onDragOver={(e) => handleDragOver(e, day.date)}
                onDragLeave={onDragLeaveDay}
                onDrop={(e) => handleDrop(e, day.date)}
              >
                <div className="day-number">{dayNumber}</div>
                <div className="dot-row">
                  {dayEntries.slice(0, 8).map((en) => {
                    const shade = shadeForPoints(en.assignedToUserId.color, en.choreId.defaultPoints);
                    return <span key={en._id} className="dot" style={{ background: shade }} />;
                  })}
                  {dayEntries.length > 8 && <span className="dot more">+{dayEntries.length - 8}</span>}
                </div>

                <ul className="list compact" style={{ marginTop: 8 }}>
                  {dayEntries.map((en) => (
                    <li key={en._id} className="mini-item">
                      <strong>{en.choreId.title}</strong> · {en.choreId.defaultPoints}p
                      <p className="hint" style={{ opacity: 0.9 }}>
                        {en.assignedToUserId.name} — {en.status}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
