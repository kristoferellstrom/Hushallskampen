export const formatDateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setDate(date.getDate() - (day - 1));
  return date;
};

export const getGridRange = (currentMonth: Date) => {
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridEnd.getDate() + 42);
  return { start: formatDateLocal(gridStart), endExclusive: formatDateLocal(gridEnd) };
};

export const buildMonthGrid = (currentMonth: Date) => {
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const gridStart = startOfWeek(monthStart);

  const grid: Array<{ date: string; inMonth: boolean }> = [];
  const cursor = new Date(gridStart);

  while (grid.length < 42) {
    const inMonth = cursor >= monthStart && cursor <= monthEnd;
    grid.push({ date: formatDateLocal(cursor), inMonth });
    cursor.setDate(cursor.getDate() + 1);
  }

  return grid;
};

export const buildWeekGrid = (anchor: Date) => {
  const start = startOfWeek(anchor);
  const days: Array<{ date: string }> = [];
  const cursor = new Date(start);

  for (let i = 0; i < 7; i++) {
    days.push({ date: formatDateLocal(cursor) });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};
