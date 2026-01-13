import type { Entry, HeatDay, MonthDay } from "../../types/calendar";
import { CalendarDayCell } from "./CalendarDayCell";
import { CalendarDots } from "./CalendarDots";
import { CalendarHeatmap } from "./CalendarHeatmap";

type Props = {
  monthGrid: MonthDay[];
  entriesByDay: Record<string, Entry[]>;
  selectedDay: string;
  onSelectDay: (day: string) => void;

  dragOverDay: string | null;
  onDragOverDay: (day: string) => void;
  onDragLeaveDay: () => void;
  onDropDay: (day: string, payload: { entryId?: string; choreId?: string }) => void;

  showHeatmap: boolean;
  heatmapData: HeatDay[];
};

export const CalendarMonthView = ({
  monthGrid,
  entriesByDay,
  selectedDay,
  onSelectDay,
  dragOverDay,
  onDragOverDay,
  onDragLeaveDay,
  onDropDay,
  showHeatmap,
  heatmapData,
}: Props) => {
  return (
    <>
      <div className="month-grid">
        {monthGrid.map((day) => {
          const dayEntries = entriesByDay[day.date] || [];
          const dayNumber = Number(day.date.slice(-2));

          return (
            <CalendarDayCell
              key={day.date}
              day={day.date}
              dayNumber={dayNumber}
              muted={!day.inMonth}
              selected={selectedDay === day.date}
              dragOver={dragOverDay === day.date}
              onSelectDay={onSelectDay}
              onDragOverDay={onDragOverDay}
              onDragLeaveDay={onDragLeaveDay}
              onDropDay={onDropDay}
            >
              <CalendarDots entries={dayEntries} />
            </CalendarDayCell>
          );
        })}
      </div>

      {showHeatmap && <CalendarHeatmap data={heatmapData} />}
    </>
  );
};
