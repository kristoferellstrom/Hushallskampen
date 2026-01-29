import { useEffect, useState } from "react";
import { useSettingsPage } from "../hooks/useSettingsPage";
import { useAuth } from "../context/AuthContext";
import { fetchMonthlyBadges, listMembers } from "../api";
import type { MonthlyBadge, PointsWinner } from "../api";
import { colorPreview, fallbackColorForUser, textColorForBackground } from "../utils/palette";
import { listApprovals } from "../api";

import { SettingsHeroGrid } from "../components/settings/SettingsHeroGrid";
import { SettingsContentGrid } from "../components/settings/SettingsContentGrid";
import { SettingsHeader } from "../components/settings/SettingsHeader";
import { SettingsMobileNav } from "../components/settings/SettingsMobileNav";
import { mobileNavItems } from "../components/MobileNavIcons";

export const SettingsPage = () => {
  const { token, user, logout } = useAuth();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const {
    invite,
    name,
    colorStatus,
    colorError,
    mode,
    prize,
    monthPrize,
    yearPrize,
    updatingHousehold,
    members,
    rulesText,
    targetShares,

    availableColors,
    colorLabels,
    usedColors,
    userColor,
    householdDirty,

    setName,
    setMode,
    setPrize,
    setMonthPrize,
    setYearPrize,
    setRulesText,

    handleUpdateHousehold,
    handleColor,
    setTargetShareForMember,
  } = useSettingsPage();
  const [choreBadges, setChoreBadges] = useState<MonthlyBadge[]>([]);
  const [badgeError, setBadgeError] = useState("");
  const [monthPointsWinner, setMonthPointsWinner] = useState<PointsWinner | null>(null);
  const [latestMonthKey, setLatestMonthKey] = useState<string | null>(null);
  const [memberColor, setMemberColor] = useState<string | undefined>(undefined);
  const [approvalCount, setApprovalCount] = useState<number>(0);
  const [editingRules, setEditingRules] = useState(false);
  const [lastSavedRules, setLastSavedRules] = useState<string>("");
  const [lastSavedColor, setLastSavedColor] = useState<string | undefined>(undefined);
  const [initializedBaseline, setInitializedBaseline] = useState(false);
  const hasLoadedHousehold = Boolean(invite || name || prize || rulesText || members.length);
  const saveDisabled = updatingHousehold || !householdDirty;

  useEffect(() => {
    const loadColor = async () => {
      try {
        if (!token || !user?.id) return;
        const res = await listMembers(token);
        const me = res.members.find((m: any) => m._id === user.id);
        if (me?.color) setMemberColor(me.color);
      } catch {

      }
    };
    loadColor();
  }, [token, user?.id]);

  useEffect(() => {
    const me = members?.find((m: any) => m._id === user?.id);
    if (me?.color) setMemberColor(me.color);
  }, [members, user?.id]);

  useEffect(() => {
    if (!initializedBaseline && hasLoadedHousehold) {
      setLastSavedColor(userColor ?? "");
      setLastSavedRules(rulesText ?? "");
      setInitializedBaseline(true);
    }
  }, [initializedBaseline, hasLoadedHousehold, userColor, rulesText]);

  useEffect(() => {
    if (initializedBaseline) {
      if (!lastSavedColor && userColor) {
        setLastSavedColor(userColor);
      }
      if (!lastSavedRules && rulesText) {
        setLastSavedRules(rulesText);
      }
    }
  }, [initializedBaseline, lastSavedColor, lastSavedRules, userColor, rulesText]);

  useEffect(() => {
    const loadApprovals = async () => {
      try {
        if (!token) return;
        const res = await listApprovals(token);
        const mine = user?.id;
        const pendingForMe = res.approvals.filter((a: any) => a.submittedByUserId?._id !== mine);
        setApprovalCount(pendingForMe.length || 0);
      } catch {
        setApprovalCount(0);
      }
    };
    loadApprovals();
  }, [token, user?.id]);

  const shellColor = (() => {
    const base = memberColor || user?.color;
    if (!base) return fallbackColorForUser(user?.id || "");
    if (base.startsWith("#")) return base;
    return colorPreview(base) || fallbackColorForUser(user?.id || "");
  })();
  const shellColorFg = textColorForBackground(shellColor);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const res = await fetchMonthlyBadges(token);
        setChoreBadges(res.badges || []);
        setMonthPointsWinner((res as any).monthPointsWinner || null);
        setLatestMonthKey((res as any).latestCompletedMonthKey || null);
        setBadgeError("");
      } catch (err) {
        setBadgeError(err instanceof Error ? err.message : "Kunde inte hämta badges");
      }
    };
    load();
  }, [token]);

  const myId = user?.id;
  const myChoreBadges = choreBadges.filter((b) => b.winners.some((w) => w.userId === myId && w.wins > 0));
  const memberNames = (members || []).map((m) => m.name).join(", ");
  const memberCount = members?.length ?? 0;
  const showPrizes = mode === "competition";
  const navItems = mobileNavItems(showPrizes);

  return (
    <div
      className="shell home-shell"
      style={{
        ["--user-color" as any]: shellColor,
        ["--user-color-fg" as any]: shellColorFg,
        paddingTop: 0,
      }}
    >
      <SettingsHeader
        mode={mode}
        approvalCount={approvalCount}
        logout={logout}
        shellColor={shellColor}
        shellColorFg={shellColorFg}
      />

      <SettingsHeroGrid
        name={name}
        memberCount={memberCount}
        memberNames={memberNames}
        invite={invite}
        availableColors={availableColors}
        colorLabels={colorLabels}
        usedColors={usedColors}
        userColor={userColor}
        members={members}
        colorStatus={colorStatus}
        colorError={colorError}
        rulesText={rulesText}
        onRulesChange={setRulesText}
        editingRules={editingRules}
        onEditToggle={() => setEditingRules(true)}
        lastSavedRules={lastSavedRules}
        lastSavedColor={lastSavedColor}
        initializedBaseline={initializedBaseline}
        onSaveColor={async (c) => {
          await handleColor(c);
          await handleUpdateHousehold();
          setEditingRules(false);
          setLastSavedRules(rulesText || "");
          setLastSavedColor(c);
        }}
        updatingHousehold={updatingHousehold}
        mode={mode}
        setMode={setMode}
        saveDisabled={saveDisabled}
        handleUpdateHousehold={handleUpdateHousehold}
      />

      <SettingsContentGrid
        mode={mode}
        name={name}
        prize={prize}
        monthPrize={monthPrize}
        yearPrize={yearPrize}
        members={members}
        targetShares={targetShares}
        updatingHousehold={updatingHousehold}
        setName={setName}
        setPrize={setPrize}
        setMonthPrize={setMonthPrize}
        setYearPrize={setYearPrize}
        setTargetShareForMember={setTargetShareForMember}
        handleUpdateHousehold={handleUpdateHousehold}
        saveDisabled={saveDisabled}
        badgeError={badgeError}
        myChoreBadges={myChoreBadges}
        latestMonthKey={latestMonthKey}
        monthPointsWinner={monthPointsWinner}
        myId={myId}
      />

      <SettingsMobileNav
        navItems={navItems}
        approvalCount={approvalCount}
        logout={logout}
        shellColor={shellColor}
        shellColorFg={shellColorFg}
      />
    </div>
  );
};
