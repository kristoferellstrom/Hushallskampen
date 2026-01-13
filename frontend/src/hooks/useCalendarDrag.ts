import { useState } from "react";

export const useCalendarDrag = () => {
  const [dragChoreId, setDragChoreId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const resetDrag = () => {
    setDragChoreId(null);
    setDragOverDay(null);
  };

  return {
    dragChoreId,
    setDragChoreId,
    dragOverDay,
    setDragOverDay,
    resetDrag,
  };
};
