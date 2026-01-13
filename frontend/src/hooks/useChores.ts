import { useCallback, useEffect, useState } from "react";
import { createChore, deleteChore, fetchChores, updateChore } from "../api";

export type Chore = {
  _id: string;
  title: string;
  defaultPoints: number;
  description?: string;
};

type CreatePayload = { title: string; defaultPoints: number; description?: string };
type UpdatePayload = { title: string; defaultPoints: number; description?: string };

export const useChores = (token: string | null | undefined) => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadChores = useCallback(async () => {
    if (!token) return;
    setStatus("Hämtar sysslor...");
    setError("");
    try {
      const res = await fetchChores(token);
      setChores(res.chores);
      setStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta");
      setStatus("");
    }
  }, [token]);

  useEffect(() => {
    loadChores();
  }, [loadChores]);

  const create = useCallback(
    async (payload: CreatePayload) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        await createChore(token, payload);
        setStatus("Skapade syssla");
        await loadChores();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte skapa syssla");
      } finally {
        setLoading(false);
      }
    },
    [token, loadChores]
  );

  const update = useCallback(
    async (id: string, payload: UpdatePayload) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        await updateChore(token, id, payload);
        setStatus("Uppdaterade syssla");
        await loadChores();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte uppdatera");
      } finally {
        setLoading(false);
      }
    },
    [token, loadChores]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        await deleteChore(token, id);
        setStatus("Tog bort syssla");
        await loadChores();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte ta bort");
      } finally {
        setLoading(false);
      }
    },
    [token, loadChores]
  );

  return {
    chores,
    status,
    error,
    loading,
    loadChores,
    create,
    update,
    remove,
    setStatus,
    setError,
  };
};
