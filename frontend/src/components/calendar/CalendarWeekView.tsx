import type { Entry, WeekDay } from "../../types/calendar";
import { CalendarDayCell } from "./CalendarDayCell";
import { CalendarDots } from "./CalendarDots";

type Props = {
  weekGrid: WeekDay[];
  entriesByDay: Record<string, Entry[]>;
  selectedDay: string;
  userColor: string;
  onSelectDay: (day: string) => void;

  dragOverDay: string | null;
  onDragOverDay: (day: string) => void;
  onDragLeaveDay: () => void;
  onDropDay: (day: string, payload: { entryId?: string; choreId?: string }) => void;
};

export const CalendarWeekView = ({
  weekGrid,
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
    <div className="week-grid">
      {weekGrid.map((day) => {
        const dayEntries = entriesByDay[day.date] || [];
        const dayNumber = Number(day.date.slice(-2));

        return (
          <CalendarDayCell
            key={day.date}
            day={day.date}
            dayNumber={dayNumber}
            selected={selectedDay === day.date}
            dragOver={dragOverDay === day.date}
            userColor={userColor}
            onSelectDay={onSelectDay}
            onDragOverDay={onDragOverDay}
            onDragLeaveDay={onDragLeaveDay}
            onDropDay={onDropDay}
          >
            <CalendarDots entries={dayEntries} />

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
          </CalendarDayCell>
        );
      })}
    </div>
  );
};
