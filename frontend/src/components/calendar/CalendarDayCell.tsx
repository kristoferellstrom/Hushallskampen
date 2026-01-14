import type { DragEvent, ReactNode } from "react";

type Props = {
  day: string;
  dayNumber: number;

  muted?: boolean;
  selected: boolean;
  dragOver: boolean;
  userColor: string;

  onSelectDay: (day: string) => void;
  onDragOverDay: (day: string) => void;
  onDragLeaveDay: () => void;
  onDropDay: (day: string, payload: { entryId?: string; choreId?: string }) => void;

  children: ReactNode;
};

export const CalendarDayCell = ({
  day,
  dayNumber,
  muted,
  selected,
  dragOver,
  userColor,
  onSelectDay,
  onDragOverDay,
  onDragLeaveDay,
  onDropDay,
  children,
}: Props) => {
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const entryId = e.dataTransfer.getData("entry-id") || undefined;
    const choreId = e.dataTransfer.getData("text/plain") || undefined;
    onDropDay(day, { entryId, choreId });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    onDragOverDay(day);
  };

  return (
    <div
      className={`day-cell ${muted ? "muted" : ""} ${selected ? "selected" : ""} ${dragOver ? "drag-over" : ""}`}
      style={
        selected
          ? {
              borderColor: userColor,
              boxShadow: `0 0 0 2px ${userColor}`,
            }
          : undefined
      }
      onClick={() => onSelectDay(day)}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeaveDay}
      onDrop={handleDrop}
    >
      <div className="day-number">{dayNumber}</div>
      {children}
    </div>
  );
};
