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
import { shadeForPoints, textColorForBackground } from "../utils/palette";
import { Logo } from "../components/Logo";

type Entry = {
  _id: string;
  date: string;
  status: string;
  assignedToUserId: { _id: string; name: string; email: string; color?: string };
  choreId: { _id: string; title: string; defaultPoints: number };
};

type Props = { embedded?: boolean };

export const CalendarPage = ({ embedded = false }: Props) => {
  const { token, user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [chores, setChores] = useState<Array<{ _id: string; title: string }>>([]);
  const [members, setMembers] = useState<Array<{ _id: string; name: string }>>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const formatDateLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => formatDateLocal(new Date()));
  const [dragChoreId, setDragChoreId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const gridRange = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = new Date(gridStart);
    gridEnd.setDate(gridEnd.getDate() + 42);
    return { start: formatDateLocal(gridStart), endExclusive: formatDateLocal(gridEnd) };
  };

  const loadAll = async () => {
    if (!token) return;
    setStatus("Laddar...");
    setError("");
    try {
      const { start, endExclusive } = gridRange();
      const [cal, ch, mem] = await Promise.all([listCalendar(token, start, endExclusive), fetchChores(token), listMembers(token)]);
      setEntries(cal.entries);
      setChores(ch.chores);
      setMembers(mem.members);
      if (!dragChoreId && ch.chores[0]) setDragChoreId(ch.chores[0]._id);
      if (!selectedAssignee && mem.members.length) {
        const preferred = mem.members.find((m) => m._id === user?.id) || mem.members[0];
        setSelectedAssignee(preferred._id);
      }
      setStatus("");
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda kalender");
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentMonth]);

  const handleSubmit = async (id: string) => {
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

  const isEligible = (e: Entry) => (e.status === "planned" || e.status === "rejected") && e.assignedToUserId._id === user?.id;

  const toggleSelect = (entry: Entry) => {
    if (!isEligible(entry)) return;
    setSelected((prev) => (prev.includes(entry._id) ? prev.filter((id) => id !== entry._id) : [...prev, entry._id]));
  };

  const handleSubmitSelected = async () => {
    if (!token) return;
    if (myPendingCount >= 5) {
      setError("Du har redan 5 sysslor som väntar på godkännande.");
      return;
    }
    const ids = entries.filter((e) => selected.includes(e._id) && isEligible(e)).map((e) => e._id);
    if (ids.length === 0) return;
    setLoading(true);
    setError("");
    try {
      for (const id of ids) {
        await submitCalendarEntry(token, id);
      }
      setStatus(`Markerade ${ids.length} poster som väntar på godkännande`);
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

  const myPendingCount = useMemo(
    () => entries.filter((e) => e.status === "submitted" && e.assignedToUserId._id === user?.id).length,
    [entries, user],
  );

  const startOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay() || 7; // Monday = 1
    if (day !== 1) date.setDate(date.getDate() - (day - 1));
    return date;
  };

  const monthGrid = useMemo(() => {
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
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });

  const todayStr = formatDateLocal(new Date());
  const selectedEntries = entriesByDay[selectedDay] || [];

  const handleDropCreate = async (day: string, choreId: string) => {
    if (!token) return;
    const assignee = selectedAssignee || members[0]?._id;
    if (!assignee) {
      setError("Välj en person att tilldela innan du släpper en syssla.");
      return;
    }
    setDragOverDay(null);
    setDragChoreId(null);
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
  };

  const content = (
    <>
      <div className="row status-row">
        {status && <p className="status ok">{status}</p>}
        {error && <p className="status error">{error}</p>}
        {myPendingCount > 0 && (
          <div className="banner warning">
            Du har {myPendingCount} syssla som väntar på godkännande. Max 5 kan ligga och vänta på granskning innan du markerar fler.
          </div>
        )}
      </div>

      <div className="row calendar-row three-cols">
        <div className="card sidebar left">
          <h3>Sysslor (pusselbitar)</h3>
          <label>
            Tilldela till
            <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)}>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <div className="puzzle-grid">
            {chores.map((c) => (
              <div
                key={c._id}
                className="puzzle"
                draggable
                onDragStart={(e) => {
                  setDragChoreId(c._id);
                  e.dataTransfer.effectAllowed = "copyMove";
                  e.dataTransfer.setData("text/plain", c._id);
                }}
                onDragEnd={() => {
                  setDragChoreId(null);
                  setDragOverDay(null);
                }}
                style={{
                  background: shadeForPoints(
                    (members.find((m) => m._id === selectedAssignee) || members[0])?.color,
                    c.defaultPoints,
                  ),
                  color: textColorForBackground(
                    shadeForPoints((members.find((m) => m._id === selectedAssignee) || members[0])?.color, c.defaultPoints),
                  ),
                }}
              >
                <strong>{c.title}</strong>
                <p className="hint">{c._id.slice(-4)}</p>
                <span className="pill">{c.defaultPoints}p</span>
              </div>
            ))}
          </div>
          <p className="hint">Dra en syssla till en dag i kalendern.</p>
        </div>

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
                  className={`day-cell ${day.inMonth ? "" : "muted"} ${selectedDay === day.date ? "selected" : ""} ${dragOverDay === day.date ? "drag-over" : ""}`}
                  onClick={() => setSelectedDay(day.date)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                    setDragOverDay(day.date);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverDay(null);
                    const cid = e.dataTransfer.getData("text/plain") || dragChoreId;
                    if (cid) handleDropCreate(day.date, cid);
                  }}
                  onDragLeave={() => setDragOverDay(null)}
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

        <div className="card sidebar right">
          <div className="row">
            <strong>Vald dag</strong>
            <span className="pill light">{selectedDay}</span>
          </div>
          {selectedEntries.length === 0 && <p className="hint">Inga åtaganden denna dag.</p>}
          <ul className="list compact">
            {selectedEntries.map((e) => {
              const shade = shadeForPoints(e.assignedToUserId.color, e.choreId.defaultPoints);
              const textColor = textColorForBackground(shade);
              return (
                <li key={e._id} className="mini-item" style={{ background: shade, color: textColor }}>
                  <div>
                    <strong>{e.choreId.title}</strong> · {e.choreId.defaultPoints}p
                <p className="hint" style={{ color: textColor, opacity: 0.9 }}>
                  {e.assignedToUserId.name} — {e.status === "rejected" ? "avvisad, gör om" : e.status}
                </p>
              </div>
              <div className="actions">
                {isEligible(e) && (
                  <button type="button" onClick={() => handleSubmit(e._id)} disabled={loading || myPendingCount >= 5}>
                    {e.status === "rejected" ? "Markera igen" : "Klar"}
                  </button>
                )}
                    {(e.status === "planned" || e.status === "rejected") && (
                      <button
                        type="button"
                        className="icon-btn corner-btn"
                        aria-label="Ta bort"
                        onClick={() => handleDelete(e._id)}
                        disabled={loading}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return (
      <section id="kalender">
        {content}
      </section>
    );
  }

  return (
    <div className="shell">
      <Link className="back-link" to="/dashboard">
        ← Till dashboard
      </Link>
      <Logo />
      {content}
    </div>
  );
};
