import { useCallback, useEffect, useState } from "react";
import { createChore, deleteChore, fetchChores, updateChore } from "../api";
import { emitDataUpdated } from "../utils/appEvents";

export type Chore = {
  _id: string;
  title: string;
  defaultPoints: number;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  slug?: string;
};

type CreatePayload = { title: string; defaultPoints: number; description?: string };
type UpdatePayload = { title: string; defaultPoints: number; description?: string; isActive?: boolean };

export const useChores = (token: string | null | undefined) => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const defaultSlugs = new Set(["diska", "dammsuga", "tvatta", "toalett", "fixare", "handla", "husdjur", "kock", "sopor"]);
  const defaultNameMap: Record<string, string> = {
    diska: "diska",
    disk: "diska",
    diskning: "diska",
    dammsuga: "dammsuga",
    dammsugning: "dammsuga",
    tvatta: "tvatta",
    tvatt: "tvatta",
    tvätt: "tvatta",
    toalett: "toalett",
    stadatoaletten: "toalett",
    städatoaletten: "toalett",
    fixare: "fixare",
    fixa: "fixare",
    handla: "handla",
    handel: "handla",
    husdjur: "husdjur",
    djur: "husdjur",
    kock: "kock",
    laga: "kock",
    lagaMat: "kock",
    sopor: "sopor",
    avfall: "sopor",
  };

  const normalize = (s?: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  const loadChores = useCallback(async () => {
    if (!token) return;
    setStatus("Hämtar sysslor...");
    setError("");
    try {
      const res = await fetchChores(token);
      const mapped = (res.chores || []).map((c) => ({
        ...c,
        isActive: c.isActive ?? true,
        isDefault:
          c.isDefault ||
          (c.slug ? defaultSlugs.has(c.slug) : false) ||
          (() => {
            const key = normalize(c.title);
            const base = defaultNameMap[key];
            if (base && defaultSlugs.has(base)) return true;
            return false;
          })(),
      }));
      setChores(mapped);
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
        emitDataUpdated();
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
        emitDataUpdated();
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
        emitDataUpdated();
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
