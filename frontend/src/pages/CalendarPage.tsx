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
import { colorPreview, fallbackColorForUser } from "../utils/palette";
import { getHousehold } from "../api";

type Props = { embedded?: boolean };

export const CalendarPage = ({ embedded = false }: Props) => {
  const { token, user } = useAuth();

  const drag = useCalendarDrag();
  const cal = useCalendarData(token, user);
  const [householdMode, setHouseholdMode] = useState<"competition" | "equality">(
    () => (localStorage.getItem("householdMode") === "equality" ? "equality" : "competition"),
  );

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
    const date = window.prompt("Ange datum (YYYY-MM-DD):", cal.selectedDay || cal.monthGrid[0]?.date.slice(0, 10));
    if (!date) return;
    const suffix = householdMode === "equality" ? "h" : "p";
    const list = cal.chores.map((c) => `${c.title} (${c.defaultPoints}${suffix})`).join("\n");
    const title = window.prompt(`Välj syssla (skriv exakt titel):\n${list}`);
    if (!title) return;
    const chore = cal.chores.find((c) => c.title.toLowerCase() === title.toLowerCase());
    if (!chore) {
      cal.setError("Hittade ingen syssla med det namnet.");
      return;
    }
    actions.handleDropCreate(date, chore._id);
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
            <img src="/figure/man_vacuum.png" alt="" loading="lazy" />
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
