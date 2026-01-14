import { Link } from "react-router-dom";
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

type Props = { embedded?: boolean };

export const CalendarPage = ({ embedded = false }: Props) => {
  const { token, user } = useAuth();

  const drag = useCalendarDrag();
  const cal = useCalendarData(token, user);

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

  const content = (
    <>
      <CalendarStatusRow status={cal.status} error={cal.error} myPendingCount={cal.myPendingCount} />

      <div className="row calendar-row three-cols" style={{ ["--user-color" as any]: userColor }}>
        <ChoreSidebar
          chores={cal.chores}
          members={cal.members}
          selectedAssignee={cal.selectedAssignee}
          onChangeAssignee={cal.setSelectedAssignee}
          onDragStartChore={(choreId, e) => {
            drag.setDragChoreId(choreId);
            e.dataTransfer.effectAllowed = "copyMove";
            e.dataTransfer.setData("text/plain", choreId);
          }}
          onDragEndChore={drag.resetDrag}
        />

        <CalendarBoard
          monthLabel={cal.monthLabel}
          loading={cal.loading}
          currentMonth={cal.currentMonth}
          userColor={userColor}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onCopyLastWeek={actions.handleCopyLastWeek}
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

        <SelectedDaySidebar
          selectedDay={cal.selectedDay}
          entries={cal.selectedEntries}
          loading={cal.loading}
          myPendingCount={cal.myPendingCount}
          userColor={userColor}
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
