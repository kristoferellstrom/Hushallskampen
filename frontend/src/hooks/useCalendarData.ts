import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchChores, listCalendar, listMembers } from "../api";
import { buildMonthGrid, buildWeekGrid, formatDateLocal, getGridRange } from "../utils/calendarDates";
import type { CalendarEntry, CalendarChore, CalendarMember } from "../types/calendar";
import { onDataUpdated } from "../utils/appEvents";

type UserLike = { id?: string } | null;

export const useCalendarData = (token: string | null, user: UserLike) => {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [chores, setChores] = useState<CalendarChore[]>([]);
  const [members, setMembers] = useState<CalendarMember[]>([]);

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState<string>("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [view, setView] = useState<"month" | "week">("month");

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => formatDateLocal(new Date()));
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const monthLabel = useMemo(
    () => currentMonth.toLocaleDateString("sv-SE", { month: "long", year: "numeric" }),
    [currentMonth],
  );

  const monthGrid = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);
  const weekGrid = useMemo(() => buildWeekGrid(currentMonth), [currentMonth]);

  const entriesByDay = useMemo(() => {
    const groups: Record<string, CalendarEntry[]> = {};
    const filtered = entries.filter((e) => {
      if (filter === "all") return true;
      if (filter === "submitted") return e.status === "submitted";
      return e.assignedToUserId._id === filter;
    });

    for (const e of filtered) {
      const key = e.date.slice(0, 10);
      (groups[key] ||= []).push(e);
    }
    return groups;
  }, [entries, filter]);

  const selectedEntries = useMemo(() => entriesByDay[selectedDay] || [], [entriesByDay, selectedDay]);

  const myPendingCount = useMemo(
    () => entries.filter((e) => e.status === "submitted" && e.assignedToUserId._id === user?.id).length,
    [entries, user?.id],
  );

  const heatmapData = useMemo(() => {
    return monthGrid.map((day) => {
      const dayEntries = entriesByDay[day.date] || [];
      const totalPoints = dayEntries.reduce(
        (sum, e) => sum + (e.choreId?.defaultPoints ?? 0),
        0,
      );
      return { date: day.date, inMonth: day.inMonth, count: dayEntries.length, points: totalPoints };
    });
  }, [monthGrid, entriesByDay]);

  const loadAll = useCallback(async () => {
    if (!token) return;

    setStatus("Laddar...");
    setError("");

    try {
      const { start, endExclusive } = getGridRange(currentMonth);
      const [cal, ch, mem] = await Promise.all([
        listCalendar(token, start, endExclusive),
        fetchChores(token),
        listMembers(token),
      ]);

      setEntries(cal.entries);
      const activeChores = (ch.chores || []).filter((c: any) => c.isActive !== false);
      setChores(activeChores);
      setMembers(mem.members);

      if (!selectedAssignee && mem.members.length) {
        const preferred = mem.members.find((m) => m._id === user?.id) || mem.members[0];
        setSelectedAssignee(preferred._id);
      }

      setStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda kalender");
    }
  }, [token, currentMonth, selectedAssignee, user?.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => onDataUpdated(loadAll), [loadAll]);

  return {
    entries,
    setEntries,
    chores,
    members,

    status,
    setStatus,
    error,
    setError,
    loading,
    setLoading,

    filter,
    setFilter,
    showHeatmap,
    setShowHeatmap,
    view,
    setView,

    currentMonth,
    setCurrentMonth,
    selectedDay,
    setSelectedDay,
    selectedAssignee,
    setSelectedAssignee,

    monthLabel,
    monthGrid,
    weekGrid,

    entriesByDay,
    selectedEntries,
    myPendingCount,
    heatmapData,

    loadAll,
  };
};
