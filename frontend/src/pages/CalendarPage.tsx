import { useEffect, useMemo, useState } from "react";
import {
  createCalendarEntry,
  deleteCalendarEntry,
  listCalendar,
  listMembers,
  fetchChores,
  submitCalendarEntry,
} from "../api/client";
import { useAuth } from "../context/AuthContext";

type Entry = {
  _id: string;
  date: string;
  status: string;
  assignedToUserId: { _id: string; name: string; email: string };
  choreId: { _id: string; title: string; defaultPoints: number };
};

export const CalendarPage = () => {
  const { token, user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [chores, setChores] = useState<Array<{ _id: string; title: string }>>([]);
  const [members, setMembers] = useState<Array<{ _id: string; name: string }>>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [choreId, setChoreId] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState("");

  const loadAll = async () => {
    if (!token) return;
    setStatus("Laddar...");
    setError("");
    try {
      const [cal, ch, mem] = await Promise.all([listCalendar(token), fetchChores(token), listMembers(token)]);
      setEntries(cal.entries);
      setChores(ch.chores);
      setMembers(mem.members);
      if (!choreId && ch.chores[0]) setChoreId(ch.chores[0]._id);
      if (!assignedToUserId && mem.members[0]) setAssignedToUserId(mem.members[0]._id);
      setStatus(`Hämtade ${cal.entries.length} poster`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda kalender");
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await createCalendarEntry(token, { choreId, date, assignedToUserId });
      setStatus("Skapade kalenderpost");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skapa post");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (id: string) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await submitCalendarEntry(token, id);
      setStatus("Markerad som klar (pending approval)");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte markera");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
  };

  const entriesByDay = useMemo(() => {
    const groups: Record<string, Entry[]> = {};
    entries.forEach((e) => {
      const key = e.date.slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [entries]);

  const days = useMemo(() => {
    const keys = Object.keys(entriesByDay).sort();
    if (keys.length === 0) return [new Date().toISOString().slice(0, 10)];
    return keys;
  }, [entriesByDay]);

  return (
    <div className="shell">
      <header>
        <div>
          <p className="eyebrow">Kalender</p>
          <h1>Planera veckan</h1>
          <p className="hint">Skapa poster och markera som klara</p>
        </div>
      </header>

      <div className="grid">
        <form className="card" onSubmit={handleCreate}>
          <h2>Ny post</h2>
          <label>
            Datum
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Syssla
            <select value={choreId} onChange={(e) => setChoreId(e.target.value)} required>
              {chores.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tilldelad
            <select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)} required>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={loading}>
            Lägg till
          </button>
        </form>
      </div>

      <div className="card">
        <div className="row">
          {status && <p className="status ok">{status}</p>}
          {error && <p className="status error">{error}</p>}
          {!status && !error && <p className="hint">Antal: {entries.length}</p>}
        </div>
        <div className="calendar-grid">
          {days.map((day) => (
            <div key={day} className="calendar-day">
              <div className="day-header">
                <strong>{day}</strong>
              </div>
              <ul className="list">
                {(entriesByDay[day] || []).map((e) => (
                  <li key={e._id} className={`status-pill ${e.status}`}>
                    <div className="row">
                      <div>
                        <strong>{e.choreId.title}</strong> · {e.choreId.defaultPoints}p
                        <p className="hint">{e.assignedToUserId.name}</p>
                        <p className="hint">Status: {e.status}</p>
                      </div>
                      <div className="actions">
                        <button
                          type="button"
                          disabled={loading || e.status !== "planned" || e.assignedToUserId._id !== user?.id}
                          onClick={() => handleSubmit(e._id)}
                        >
                          Markera klar
                        </button>
                        <button
                          type="button"
                          disabled={loading || (e.status !== "planned" && e.status !== "rejected")}
                          onClick={() => handleDelete(e._id)}
                        >
                          Ta bort
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
