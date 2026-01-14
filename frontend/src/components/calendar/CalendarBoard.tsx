import type { Entry, HeatDay, Member, MonthDay, WeekDay } from "../../types/calendar";
import { textColorForBackground } from "../../utils/palette";
import { CalendarWeekdays } from "./CalendarWeekdays";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarHeatmap } from "./CalendarHeatmap";

type Props = {
  monthLabel: string;
  loading: boolean;

  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  userColor: string;

  members: Member[];
  filter: string;
  onChangeFilter: (v: string) => void;

  view: "month" | "week";
  onChangeView: (v: "month" | "week") => void;

  showHeatmap: boolean;
  onToggleHeatmap: () => void;

  onCopyLastWeek: () => void;
  onManualAdd: () => void;

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
  userColor,
  members,
  filter,
  onChangeFilter,
  view,
  onChangeView,
  showHeatmap,
  onToggleHeatmap,
  onCopyLastWeek,
  onManualAdd,
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
  const arrowStyle = {
    background: userColor,
    color: textColorForBackground(userColor),
    border: "none",
  };
  const toggleStyle = (isActive: boolean) =>
    isActive
      ? {
          background: userColor,
          color: textColorForBackground(userColor),
          border: "none",
        }
      : {
          background: "transparent",
          color: userColor,
          border: "none",
          boxShadow: "none",
        };

  return (
    <div className="card calendar-card">
      <div className="month-nav">
        <button type="button" onClick={onPrevMonth} style={arrowStyle}>
          ←
        </button>

        <div>
          <strong>{monthLabel}</strong>
        </div>

        <button type="button" onClick={onNextMonth} style={arrowStyle}>
          →
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
          <button
            type="button"
            className={view === "month" ? "active" : ""}
            style={toggleStyle(view === "month")}
            onClick={() => onChangeView("month")}
          >
            Månad
          </button>
          <button
            type="button"
            className={view === "week" ? "active" : ""}
            style={toggleStyle(view === "week")}
            onClick={() => onChangeView("week")}
          >
            Vecka
          </button>
        </div>

      </div>

      <CalendarWeekdays />

      {view === "month" ? (
        <CalendarMonthView
          monthGrid={monthGrid}
          entriesByDay={entriesByDay}
          selectedDay={selectedDay}
          userColor={userColor}
          onSelectDay={onSelectDay}
          dragOverDay={dragOverDay}
          onDragOverDay={onDragOverDay}
          onDragLeaveDay={onDragLeaveDay}
          onDropDay={onDropDay}
        />
      ) : (
        <CalendarWeekView
          weekGrid={weekGrid}
          entriesByDay={entriesByDay}
          selectedDay={selectedDay}
          userColor={userColor}
          onSelectDay={onSelectDay}
          dragOverDay={dragOverDay}
          onDragOverDay={onDragOverDay}
          onDragLeaveDay={onDragLeaveDay}
          onDropDay={onDropDay}
        />
      )}

      <div
        className="month-footer row"
        style={{ justifyContent: "flex-end", gap: 6, flexWrap: "wrap", marginTop: 0, marginBottom: 0, paddingRight: 0 }}
      >
        <button
          type="button"
          className="chip"
          onClick={onManualAdd}
          style={{
            flex: "0 0 auto",
            minWidth: 120,
            background: userColor,
            color: textColorForBackground(userColor),
            border: "none",
          }}
        >
          Lägg till manuellt
        </button>
        <button
          type="button"
          className="chip"
          onClick={onCopyLastWeek}
          disabled={loading}
          style={{
            flex: "0 0 auto",
            minWidth: 120,
            background: userColor,
            color: textColorForBackground(userColor),
            border: "none",
          }}
        >
          Kopiera förra veckan
        </button>
        <button
          type="button"
          className="chip"
          onClick={onToggleHeatmap}
          style={{
            flex: "0 0 auto",
            minWidth: 120,
            background: userColor,
            color: textColorForBackground(userColor),
            border: "none",
          }}
        >
          {showHeatmap ? "Dölj heatmap" : "Visa heatmap"}
        </button>
      </div>

      {showHeatmap && view === "month" && <CalendarHeatmap data={heatmapData} />}
    </div>
  );
};
