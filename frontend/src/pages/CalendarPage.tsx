import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { useCalendarData } from "../hooks/useCalendarData";

import { useCalendarActions } from "../hooks/useCalendarActions";
import { useCalendarDrag } from "../hooks/useCalendarDrag";

import { CalendarStatusRow } from "../components/calendar/CalendarStatusRow";

import { ChoreSidebar } from "../components/calendar/ChoreSidebar";
import { CalendarBoard } from "../components/calendar/CalendarBoard";
import { SelectedDaySidebar } from "../components/calendar/SelectedDaySidebar";
import { colorPreview, fallbackColorForUser, textColorForBackground } from "../utils/palette";
import { getHousehold } from "../api";

type Props = { embedded?: boolean };

export const CalendarPage = ({ embedded = false }: Props) => {
  const { token, user } = useAuth();

  const drag = useCalendarDrag();
  const cal = useCalendarData(token, user);
  const [householdMode, setHouseholdMode] = useState<"competition" | "equality">(
    () => (localStorage.getItem("householdMode") === "equality" ? "equality" : "competition"),
  );
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [manualChoreId, setManualChoreId] = useState<string>("");

  const actions = useCalendarActions({
    token,
    userId: user?.id,
    members: cal.members,
    selectedAssignee: cal.selectedAssignee,
    myPendingCount: cal.myPendingCount,
    setSelectedDay: cal.setSelectedDay,
    setStatus: cal.setStatus,
    setError: cal.setError,
    setLoading: cal.setLoading,
    loadAll: cal.loadAll,
  });

  const handlePrevMonth = () =>
    cal.setCurrentMonth(new Date(cal.currentMonth.getFullYear(), cal.currentMonth.getMonth() - 1, 1));

  const handleNextMonth = () =>
    cal.setCurrentMonth(new Date(cal.currentMonth.getFullYear(), cal.currentMonth.getMonth() + 1, 1));

  const handleManualAdd = () => {
    if (!cal.chores.length) {
      cal.setError("Inga sysslor att lägga till ännu.");
      return;
    }
    const prefillDate = cal.selectedDay || cal.monthGrid[0]?.date.slice(0, 10) || "";
    setManualDate(prefillDate);
    setManualChoreId(cal.chores[0]?._id || "");
    setShowManualModal(true);
  };

  const handleDropDay = (day: string, payload: { entryId?: string; choreId?: string }) => {
    drag.setDragOverDay(null);

    if (payload.entryId) {
      actions.handleMoveEntry(payload.entryId, day);
      return;
    }

    const cid = payload.choreId || drag.dragChoreId;
    if (cid) actions.handleDropCreate(day, cid);
  };

  const userColor = (() => {
    const me = cal.members.find((m) => m._id === user?.id);
    const base = user?.color || me?.color;
    if (!base) return fallbackColorForUser(user?.id || "");
    if (base.startsWith("#")) return base;
    const preview = colorPreview(base);
    return preview || fallbackColorForUser(user?.id || "");
  })();
  const activeFg = textColorForBackground(userColor);

  useEffect(() => {
    const loadMode = async () => {
      try {
        if (!token) return;
        const res = await getHousehold(token);
        const mode = res.household?.mode === "equality" ? "equality" : "competition";
        setHouseholdMode(mode);
        localStorage.setItem("householdMode", mode);
      } catch {
        const mode = localStorage.getItem("householdMode") === "equality" ? "equality" : "competition";
        setHouseholdMode(mode);
      }
    };
    loadMode();
  }, [token]);

  const content = (
    <>
      <CalendarStatusRow status={cal.status} error={cal.error} />

      <div className="row calendar-row three-cols" style={{ ["--user-color" as any]: userColor }}>
        <ChoreSidebar
          chores={cal.chores}
          members={cal.members}
          selectedAssignee={cal.selectedAssignee}
          onChangeAssignee={cal.setSelectedAssignee}
          pointsSuffix={householdMode === "equality" ? "h" : "p"}
          onDragStartChore={(choreId, e) => {
            drag.setDragChoreId(choreId);
            e.dataTransfer.effectAllowed = "copyMove";
            e.dataTransfer.setData("text/plain", choreId);
          }}
          onDragEndChore={drag.resetDrag}
        />

        <div className="calendar-column">
          <div className="calendar-corner-figure" aria-hidden="true">
            <img
              src="/figure/man_vacuum.webp"
              alt="Illustration av dammsugning"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              width="1200"
              height="800"
            />
          </div>
          <CalendarBoard
            monthLabel={cal.monthLabel}
            loading={cal.loading}
            currentMonth={cal.currentMonth}
            userColor={userColor}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onCopyLastWeek={actions.handleCopyLastWeek}
            onManualAdd={handleManualAdd}
            members={cal.members}
            filter={cal.filter}
            onChangeFilter={cal.setFilter}
            view={cal.view}
            onChangeView={cal.setView}
            showHeatmap={cal.showHeatmap}
            onToggleHeatmap={() => cal.setShowHeatmap((v) => !v)}
            selectedDay={cal.selectedDay}
            onSelectDay={cal.setSelectedDay}
            monthGrid={cal.monthGrid}
            weekGrid={cal.weekGrid}
            entriesByDay={cal.entriesByDay}
            heatmapData={cal.heatmapData}
            dragOverDay={drag.dragOverDay}
            onDragOverDay={drag.setDragOverDay}
            onDragLeaveDay={() => drag.setDragOverDay(null)}
            onDropDay={handleDropDay}
          />

          {cal.myPendingCount >= 5 && (
            <div className="banner warning pending-banner">
              Du har 5 sysslor som väntar på godkännande. Max 5 kan ligga och vänta på granskning innan du markerar fler.
            </div>
          )}

        </div>

        <SelectedDaySidebar
          selectedDay={cal.selectedDay}
          entries={cal.selectedEntries}
          loading={cal.loading}
          myPendingCount={cal.myPendingCount}
          userColor={userColor}
          currentUserId={user?.id}
          isEligible={actions.isEligible}
          onSubmit={actions.handleSubmit}
          onDelete={actions.handleDelete}
          onDragStartEntry={(entryId, ev) => {
            ev.dataTransfer.effectAllowed = "move";
            ev.dataTransfer.setData("entry-id", entryId);
          }}
          onDragEndEntry={() => drag.setDragOverDay(null)}
        />
      </div>

      {showManualModal && (
        <div className="modal-backdrop" onClick={() => setShowManualModal(false)}>
          <div className="modal manual-modal" onClick={(e) => e.stopPropagation()} style={{ ["--user-color" as any]: userColor }}>
            <h3>Lägg till aktivitet</h3>
            <div className="modal-form">
              <label>
                Datum
                <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} required />
              </label>
              <label>
                Aktivitet
                <select value={manualChoreId} onChange={(e) => setManualChoreId(e.target.value)}>
                  {cal.chores.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="manual-actions">
                <button type="button" className="ghost" onClick={() => setShowManualModal(false)}>
                  Avbryt
                </button>
                <button
                  type="button"
                  className="save-colors-btn"
                  style={{ background: userColor, color: activeFg }}
                  onClick={() => {
                    if (!manualDate || !manualChoreId) return;
                    actions.handleDropCreate(manualDate, manualChoreId);
                    setShowManualModal(false);
                  }}
                >
                  Lägg till
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (embedded)
    return (
      <section id="kalender" style={{ ["--user-color" as any]: userColor }}>
        {content}
      </section>
    );

  return (
    <div className="shell" style={{ ["--user-color" as any]: userColor }}>
      <Link className="back-link" to="/dashboard">
        ← Till dashboard
      </Link>
      <Logo />
      {content}
    </div>
  );
};
