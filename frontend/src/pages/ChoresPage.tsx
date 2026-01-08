import { useEffect, useState } from "react";
import { createChore, deleteChore, fetchChores, updateChore } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Chore = { _id: string; title: string; defaultPoints: number; description?: string };

export const ChoresPage = () => {
  const { token } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newPoints, setNewPoints] = useState(1);
  const [newDescription, setNewDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPoints, setEditPoints] = useState(1);
  const [editDescription, setEditDescription] = useState("");

  const loadChores = async () => {
    if (!token) return;
    setStatus("Hämtar sysslor...");
    setError("");
    try {
      const res = await fetchChores(token);
      setChores(res.chores);
      setStatus(`Hämtade ${res.chores.length} sysslor`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta");
      setStatus("");
    }
  };

  useEffect(() => {
    loadChores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await createChore(token, { title: newTitle, defaultPoints: newPoints, description: newDescription || undefined });
      setNewTitle("");
      setNewPoints(1);
      setNewDescription("");
      setStatus("Skapade syssla");
      await loadChores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skapa syssla");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (chore: Chore) => {
    setEditingId(chore._id);
    setEditTitle(chore.title);
    setEditPoints(chore.defaultPoints);
    setEditDescription(chore.description || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingId) return;
    setLoading(true);
    setError("");
    try {
      await updateChore(token, editingId, {
        title: editTitle,
        defaultPoints: editPoints,
        description: editDescription || undefined,
      });
      setEditingId(null);
      setStatus("Uppdaterade syssla");
      await loadChores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
  };

  return (
    <div className="shell">
      <header>
        <div>
          <p className="eyebrow">Chores</p>
          <h1>Chore library</h1>
          <p className="hint">Lägg till, uppdatera eller ta bort sysslor i hushållet</p>
        </div>
      </header>

      <div className="grid">
        <form className="card" onSubmit={handleCreate}>
          <h2>Ny syssla</h2>
          <label>
            Titel
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          </label>
          <label>
            Poäng
            <input type="number" min={0} value={newPoints} onChange={(e) => setNewPoints(Number(e.target.value) || 0)} required />
          </label>
          <label>
            Beskrivning (valfritt)
            <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          </label>
          <button type="submit" disabled={loading}>
            Skapa syssla
          </button>
        </form>

        {editingId && (
          <form className="card" onSubmit={handleUpdate}>
            <h2>Redigera syssla</h2>
            <label>
              Titel
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
            </label>
            <label>
              Poäng
              <input type="number" min={0} value={editPoints} onChange={(e) => setEditPoints(Number(e.target.value) || 0)} required />
            </label>
            <label>
              Beskrivning
              <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </label>
            <div className="row">
              <button type="submit" disabled={loading}>
                Spara ändring
              </button>
              <button type="button" onClick={() => setEditingId(null)}>
                Avbryt
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="row">
          {status && <p className="status ok">{status}</p>}
          {error && <p className="status error">{error}</p>}
          {!status && !error && <p className="hint">Totalt: {chores.length} sysslor</p>}
        </div>
        <ul className="list">
          {chores.map((c) => (
            <li key={c._id}>
              <div className="row">
                <div>
                  <strong>{c.title}</strong> — {c.defaultPoints}p
                  {c.description && <p className="hint">{c.description}</p>}
                </div>
                <div className="actions">
                  <button type="button" onClick={() => startEdit(c)} disabled={loading}>
                    Redigera
                  </button>
                  <button type="button" onClick={() => handleDelete(c._id)} disabled={loading}>
                    Ta bort
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
