import { useCallback } from "react";
import {
  createCalendarEntry,
  deleteCalendarEntry,
  submitCalendarEntry,
  copyLastWeek,
  updateCalendarEntry,
} from "../api/client";
import type { CalendarEntry, CalendarMember } from "../types/calendar";

type Params = {
  token: string | null;
  userId?: string;
  members: CalendarMember[];
  selectedAssignee: string;

  myPendingCount: number;

  setSelectedDay: (day: string) => void;
  setStatus: (s: string) => void;
  setError: (e: string) => void;
  setLoading: (v: boolean) => void;

  loadAll: () => Promise<void>;
};

export const useCalendarActions = ({
  token,
  userId,
  members,
  selectedAssignee,
  myPendingCount,
  setSelectedDay,
  setStatus,
  setError,
  setLoading,
  loadAll,
}: Params) => {
  const isEligible = useCallback(
    (e: CalendarEntry) => (e.status === "planned" || e.status === "rejected") && e.assignedToUserId._id === userId,
    [userId],
  );

  const handleSubmit = useCallback(
    async (id: string) => {
      if (!token) return;

      if (myPendingCount >= 5) {
        setError("Du har redan 5 sysslor som väntar på godkännande.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        await submitCalendarEntry(token, id);
        setStatus("Markerad som klar (väntar på godkännande)");
        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte markera");
      } finally {
        setLoading(false);
      }
    },
    [token, myPendingCount, setError, setLoading, setStatus, loadAll],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        await deleteCalendarEntry(token, id);
        setStatus("Tog bort posten");
        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte ta bort");
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, setStatus, loadAll],
  );

  const handleDropCreate = useCallback(
    async (day: string, choreId: string) => {
      if (!token) return;

      const assignee = selectedAssignee || members[0]?._id;
      if (!assignee) {
        setError("Välj en person att tilldela innan du släpper en syssla.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        setSelectedDay(day);
        await createCalendarEntry(token, { choreId, date: day, assignedToUserId: assignee });
        setStatus("La till syssla i kalendern");
        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte lägga till syssla");
      } finally {
        setLoading(false);
      }
    },
    [token, selectedAssignee, members, setError, setLoading, setStatus, setSelectedDay, loadAll],
  );

  const handleMoveEntry = useCallback(
    async (entryId: string, day: string) => {
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        await updateCalendarEntry(token, entryId, { date: day });
        setStatus("Flyttade sysslan");
        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte flytta syssla");
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, setStatus, loadAll],
  );

  const handleCopyLastWeek = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const res = await copyLastWeek(token);
      setStatus(`Kopierade ${res.created.length} sysslor från förra veckan`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte kopiera förra veckan");
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, setError, setStatus, loadAll]);

  return {
    isEligible,
    handleSubmit,
    handleDelete,
    handleDropCreate,
    handleMoveEntry,
    handleCopyLastWeek,
  };
};
