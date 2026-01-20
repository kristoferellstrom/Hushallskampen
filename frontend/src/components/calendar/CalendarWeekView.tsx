import type { Entry, WeekDay } from "../../types/calendar";
import { shadeForPoints, textColorForBackground } from "../../utils/palette";
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
        const weekdayLabel = new Date(day.date).toLocaleDateString("sv-SE", { weekday: "short" });

        return (
          <CalendarDayCell
            key={day.date}
            day={day.date}
            dayNumber={dayNumber}
            weekdayLabel={weekdayLabel}
            selected={selectedDay === day.date}
            dragOver={dragOverDay === day.date}
            userColor={userColor}
            onSelectDay={onSelectDay}
            onDragOverDay={onDragOverDay}
            onDragLeaveDay={onDragLeaveDay}
            onDropDay={onDropDay}
          >
            <CalendarDots entries={dayEntries} />

              <div className="day-entries">
                <ul className="list compact">
                {dayEntries.map((en) => {
                  const shade = shadeForPoints(en.assignedToUserId.color, en.choreId.defaultPoints);
                  const fg = textColorForBackground(shade);
                  const statusLabel = en.status === "rejected" ? "Avvisad – gör om" : "";

                  return (
                    <li
                      key={en._id}
                      className={`mini-item ${en.status === "approved" ? "status-approved" : ""} ${
                        en.status === "rejected" ? "status-rejected" : ""
                      }`}
                      style={{ background: shade, color: fg }}
                    >
                      <div className="mini-content">
                        <div className="mini-text">
                          <div className="mini-title">
                            <span className="mini-name" style={{ color: fg }}>
                              {en.choreId.title}
                            </span>
                            <span className="mini-points">{en.choreId.defaultPoints}p</span>
                          </div>
                          <p className="hint mini-assignee" style={{ color: fg }}>
                            {en.assignedToUserId.name}
                            {statusLabel ? ` — ${statusLabel}` : ""}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CalendarDayCell>
        );
      })}
    </div>
  );
};
