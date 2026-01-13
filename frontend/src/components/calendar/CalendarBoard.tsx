import type { Entry, HeatDay, Member, MonthDay, WeekDay } from "../../types/calendar";
import { CalendarWeekdays } from "./CalendarWeekdays";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";

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

      <CalendarWeekdays />

      {view === "month" ? (
        <CalendarMonthView
          monthGrid={monthGrid}
          entriesByDay={entriesByDay}
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
          dragOverDay={dragOverDay}
          onDragOverDay={onDragOverDay}
          onDragLeaveDay={onDragLeaveDay}
          onDropDay={onDropDay}
          showHeatmap={showHeatmap}
          heatmapData={heatmapData}
        />
      ) : (
        <CalendarWeekView
          weekGrid={weekGrid}
          entriesByDay={entriesByDay}
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
          dragOverDay={dragOverDay}
          onDragOverDay={onDragOverDay}
          onDragLeaveDay={onDragLeaveDay}
          onDropDay={onDropDay}
        />
      )}
    </div>
  );
};
