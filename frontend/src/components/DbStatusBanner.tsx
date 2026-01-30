import { useEffect, useState } from "react";
import { fetchHealth } from "../api";

type DbMode = "mongo" | "memory";

export const DbStatusBanner = () => {
  const [dbMode, setDbMode] = useState<DbMode | null>(null);

  useEffect(() => {
    let alive = true;
    fetchHealth()
      .then((res) => {
        if (!alive) return;
        if (res.db) setDbMode(res.db);
        if (res.db === "memory") {
          console.warn("Backend kör in-memory MongoDB. Statistik sparas inte permanent.");
        }
      })
      .catch(() => {
        // ignore health errors
      });
    return () => {
      alive = false;
    };
  }, []);

  if (dbMode !== "memory") return null;

  return (
    <div className="db-warning" role="status" aria-live="polite">
      Backend kör in‑memory DB. Statistik sparas inte permanent.
    </div>
  );
};
