import type { Entry, MonthDay } from "../../types/calendar";
import { CalendarDayCell } from "./CalendarDayCell";
import { CalendarDots } from "./CalendarDots";

type Props = {
  monthGrid: MonthDay[];
  entriesByDay: Record<string, Entry[]>;
  selectedDay: string;
  userColor: string;
  onSelectDay: (day: string) => void;

  dragOverDay: string | null;
  onDragOverDay: (day: string) => void;
  onDragLeaveDay: () => void;
  onDropDay: (day: string, payload: { entryId?: string; choreId?: string }) => void;
};

export const CalendarMonthView = ({
  monthGrid,
  entriesByDay,
  selectedDay,
  userColor,
  onSelectDay,
  dragOverDay,
  onDragOverDay,
  onDragLeaveDay,
  onDropDay,
}: Props) => {
  return (
    <div className="month-grid">
      {monthGrid.map((day) => {
        if (!day.inMonth) {
          return <div key={day.date} className="day-cell placeholder" aria-hidden="true" />;
        }

        const dayEntries = entriesByDay[day.date] || [];
        const dayNumber = Number(day.date.slice(-2));

        return (
          <CalendarDayCell
            key={day.date}
            day={day.date}
            dayNumber={dayNumber}
            muted={false}
            selected={selectedDay === day.date}
            dragOver={dragOverDay === day.date}
            userColor={userColor}
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
  );
};
