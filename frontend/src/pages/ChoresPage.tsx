import { useEffect, useState } from "react";
import { fetchChores } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Chore = { _id: string; title: string; defaultPoints: number };

export const ChoresPage = () => {
  const { token } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setStatus("Hämtar sysslor...");
      try {
        const res = await fetchChores(token);
        setChores(res.chores);
        setStatus(`Hämtade ${res.chores.length} sysslor`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte hämta");
      }
    };
    load();
  }, [token]);

  return (
    <div className="shell">
      <header>
        <div>
          <p className="eyebrow">Chores</p>
          <h1>Chore library</h1>
          <p className="hint">Lista från backend</p>
        </div>
      </header>

      <div className="card">
        {status && <p className="status ok">{status}</p>}
        {error && <p className="status error">{error}</p>}
        <ul className="list">
          {chores.map((c) => (
            <li key={c._id}>
              <strong>{c.title}</strong> — {c.defaultPoints}p
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
