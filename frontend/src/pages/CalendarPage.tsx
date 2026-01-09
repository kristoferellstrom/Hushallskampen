import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createCalendarEntry,
  deleteCalendarEntry,
  listCalendar,
  listMembers,
  fetchChores,
  submitCalendarEntry,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { shadeForPoints } from "../utils/palette";
import { Logo } from "../components/Logo";

type Entry = {
  _id: string;
  date: string;
  status: string;
  assignedToUserId: { _id: string; name: string; email: string; color?: string };
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
  const [selected, setSelected] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));

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
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda kalender");
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  const isEligible = (e: Entry) => e.status === "planned" && e.assignedToUserId._id === user?.id;

  const toggleSelect = (entry: Entry) => {
    if (!isEligible(entry)) return;
    setSelected((prev) => (prev.includes(entry._id) ? prev.filter((id) => id !== entry._id) : [...prev, entry._id]));
  };

  const handleSubmitSelected = async () => {
    if (!token) return;
    const ids = entries.filter((e) => selected.includes(e._id) && isEligible(e)).map((e) => e._id);
    if (ids.length === 0) return;
    setLoading(true);
    setError("");
    try {
      for (const id of ids) {
        await submitCalendarEntry(token, id);
      }
      setStatus(`Markerade ${ids.length} poster som pending approval`);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte markera valda");
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

  const startOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay() || 7; // Monday = 1
    if (day !== 1) date.setDate(date.getDate() - (day - 1));
    return date;
  };

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  const monthGrid = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const gridStart = startOfWeek(monthStart);
    const grid: Array<{ date: string; inMonth: boolean }> = [];
    const cursor = new Date(gridStart);
    while (grid.length < 42) {
      const inMonth = cursor >= monthStart && cursor <= monthEnd;
      grid.push({ date: formatDate(cursor), inMonth });
      cursor.setDate(cursor.getDate() + 1);
    }
    return grid;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedEntries = entriesByDay[selectedDay] || [];

  const openModalForDate = (day: string) => {
    setSelectedDay(day);
    setModalDate(day);
    if (!choreId && chores[0]) setChoreId(chores[0]._id);
    if (!assignedToUserId && members[0]) setAssignedToUserId(members[0]._id);
    setModalOpen(true);
  };

  const handleCreateForModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !modalDate) return;
    setLoading(true);
    setError("");
    try {
      await createCalendarEntry(token, { choreId, date: modalDate, assignedToUserId });
      setStatus("Skapade kalenderpost");
      setModalOpen(false);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skapa post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell">
      <Link className="back-link" to="/dashboard">
        ← Till dashboard
      </Link>
      <Logo />
      <header>
        <div>
          <p className="eyebrow">Kalender</p>
          <h1>Planera veckan</h1>
          <p className="hint">Skapa poster och markera som klara</p>
        </div>
      </header>

      <div className="row calendar-row">
        <div className="card calendar-card">
          <div className="month-nav">
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
              ←
            </button>
            <div>
              <strong>{monthLabel}</strong>
            </div>
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
              →
            </button>
          </div>
          <div className="weekdays">
            {["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="month-grid">
            {monthGrid.map((day) => {
              const dayEntries = entriesByDay[day.date] || [];
              const dayNumber = Number(day.date.slice(-2));
              return (
                <div
                  key={day.date}
                  className={`day-cell ${day.inMonth ? "" : "muted"}`}
                  onClick={() => openModalForDate(day.date)}
                >
                  <div className="day-number">{dayNumber}</div>
                  <div className="dot-row">
                    {dayEntries.slice(0, 8).map((e) => {
                      const shade = shadeForPoints(e.assignedToUserId.color, e.choreId.defaultPoints);
                      return <span key={e._id} className="dot" style={{ background: shade }} />;
                    })}
                    {dayEntries.length > 8 && <span className="dot more">+{dayEntries.length - 8}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card sidebar">
          <div className="row">
            {status && <p className="status ok">{status}</p>}
            {error && <p className="status error">{error}</p>}
          </div>
          <div className="today-card">
            <div className="row">
              <strong>Vald dag</strong>
              <span className="pill light">{selectedDay}</span>
            </div>
            {selectedEntries.length === 0 && <p className="hint">Inga åtaganden denna dag.</p>}
            <ul className="list compact">
              {selectedEntries.map((e) => {
                const shade = shadeForPoints(e.assignedToUserId.color, e.choreId.defaultPoints);
                const textColor = e.choreId.defaultPoints > 6 ? "#ffffff" : "#0f172a";
                return (
                  <li key={e._id} className="mini-item" style={{ background: shade, color: textColor }}>
                    <div>
                      <strong>{e.choreId.title}</strong> · {e.choreId.defaultPoints}p
                      <p className="hint" style={{ color: textColor, opacity: 0.9 }}>
                        {e.assignedToUserId.name} — {e.status}
                      </p>
                    </div>
                    <div className="actions">
                      {isEligible(e) && (
                        <button type="button" onClick={() => handleSubmit(e._id)} disabled={loading}>
                          Klar
                        </button>
                      )}
                      {(e.status === "planned" || e.status === "rejected") && (
                        <button type="button" onClick={() => handleDelete(e._id)} disabled={loading}>
                          Ta bort
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="row">
            <button type="button" disabled={loading || selected.length === 0} onClick={handleSubmitSelected}>
              Markera valda
            </button>
          </div>
          <h3>Sysslor (pusselbitar)</h3>
          <div className="puzzle-grid">
            {chores.map((c) => (
              <div key={c._id} className="puzzle">
                <strong>{c.title}</strong>
                <p className="hint">{c._id.slice(-4)}</p>
                <span className="pill">{c.defaultPoints}p</span>
              </div>
            ))}
          </div>
          <p className="hint">Klicka på en dag i kalendern för att lägga till syssla.</p>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Lägg till syssla</h2>
            <form onSubmit={handleCreateForModal} className="modal-form">
              <label>
                Datum
                <input
                  type="date"
                  value={modalDate || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setModalDate(e.target.value)}
                  required
                />
              </label>
              <label>
                Syssla
                <select value={choreId} onChange={(e) => setChoreId(e.target.value)} required>
                  {chores.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.defaultPoints}p)
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
              <div className="row">
                <button type="submit" disabled={loading}>
                  Lägg till
                </button>
                <button type="button" onClick={() => setModalOpen(false)}>
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
