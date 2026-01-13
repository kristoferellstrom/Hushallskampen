import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createCalendarEntry,
  deleteCalendarEntry,
  listCalendar,
  listMembers,
  fetchChores,
  submitCalendarEntry,
  copyLastWeek,
  updateCalendarEntry,
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
  const [chores, setChores] = useState<Array<{ _id: string; title: string; defaultPoints: number }>>([]);
  const [members, setMembers] = useState<Array<{ _id: string; name: string; color?: string }>>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [view, setView] = useState<"month" | "week">("month");

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda kalender");
    }
  };

  useEffect(() => {
    loadAll();
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

  const entriesByDay = useMemo(() => {
    const groups: Record<string, Entry[]> = {};
    const filtered = entries.filter((e) => {
      if (filter === "all") return true;
      if (filter === "submitted") return e.status === "submitted";
      return e.assignedToUserId._id === filter;
    });
    filtered.forEach((e) => {
      const key = e.date.slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [entries, filter]);

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

  const weekGrid = useMemo(() => {
    const start = startOfWeek(currentMonth);
    const days: Array<{ date: string }> = [];
    const cursor = new Date(start);
    for (let i = 0; i < 7; i++) {
      days.push({ date: formatDateLocal(cursor) });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });

  const selectedEntries = entriesByDay[selectedDay] || [];

  const heatmapData = useMemo(() => {
    return monthGrid.map((day) => {
      const dayEntries = entriesByDay[day.date] || [];
      const totalPoints = dayEntries.reduce((sum, e) => sum + (e.choreId.defaultPoints || 0), 0);
      return { date: day.date, inMonth: day.inMonth, count: dayEntries.length, points: totalPoints };
    });
  }, [monthGrid, entriesByDay]);

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

  const handleMoveEntry = async (entryId: string, day: string) => {
    if (!token) return;
    setDragOverDay(null);
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
  };

  const handleCopyLastWeek = async () => {
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
            <button type="button" className="chip" onClick={handleCopyLastWeek} disabled={loading} style={{ marginLeft: 8 }}>
              Kopiera förra veckan
            </button>
          </div>
          <div className="row" style={{ marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Filter
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Alla</option>
                <option value="submitted">Väntar godkännande</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="mode-toggle" style={{ marginLeft: "auto" }}>
              <button type="button" className={view === "month" ? "active" : ""} onClick={() => setView("month")}>
                Månad
              </button>
              <button type="button" className={view === "week" ? "active" : ""} onClick={() => setView("week")}>
                Vecka
              </button>
            </div>
            <button type="button" className="chip" onClick={() => setShowHeatmap((v) => !v)}>
              {showHeatmap ? "Dölj heatmap" : "Visa heatmap"}
            </button>
          </div>
          <div className="weekdays">
            {["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          {view === "month" ? (
            <>
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
                        const entryId = e.dataTransfer.getData("entry-id");
                        if (entryId) {
                          handleMoveEntry(entryId, day.date);
                          return;
                        }
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
              {showHeatmap && (
                <div className="heatmap-grid">
                  {heatmapData.map((d) => {
                    const intensity = Math.min(1, d.count / 5 || d.points / 15);
                    const bg = `rgba(15, 23, 42, ${0.08 + intensity * 0.35})`;
                    return (
                      <div
                        key={d.date}
                        className={`heatmap-cell ${d.inMonth ? "" : "muted"}`}
                        title={`${d.date} • ${d.count} uppgifter • ${d.points}p`}
                        style={{ background: bg }}
                      >
                        <span>{Number(d.date.slice(-2))}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="week-grid">
              {weekGrid.map((day) => {
                const dayEntries = entriesByDay[day.date] || [];
                const dayNumber = Number(day.date.slice(-2));
                return (
                  <div
                    key={day.date}
                    className={`day-cell ${selectedDay === day.date ? "selected" : ""} ${dragOverDay === day.date ? "drag-over" : ""}`}
                    onClick={() => setSelectedDay(day.date)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                      setDragOverDay(day.date);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverDay(null);
                      const entryId = e.dataTransfer.getData("entry-id");
                      if (entryId) {
                        handleMoveEntry(entryId, day.date);
                        return;
                      }
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
                    <ul className="list compact" style={{ marginTop: 8 }}>
                      {dayEntries.map((e) => {
                        const shade = shadeForPoints(e.assignedToUserId.color, e.choreId.defaultPoints);
                        const textColor = textColorForBackground(shade);
                        return (
                          <li key={e._id} className="mini-item" style={{ background: shade, color: textColor }}>
                            <strong>{e.choreId.title}</strong> · {e.choreId.defaultPoints}p
                            <p className="hint" style={{ color: textColor, opacity: 0.9 }}>
                              {e.assignedToUserId.name} — {e.status}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
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
                <li
                  key={e._id}
                  className="mini-item"
                  style={{ background: shade, color: textColor }}
                  draggable={isEligible(e)}
                  onDragStart={(ev) => {
                    ev.dataTransfer.effectAllowed = "move";
                    ev.dataTransfer.setData("entry-id", e._id);
                  }}
                  onDragEnd={() => setDragOverDay(null)}
                >
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
