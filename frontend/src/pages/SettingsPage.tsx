import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettingsPage } from "../hooks/useSettingsPage";
import { useAuth } from "../context/AuthContext";
import { fetchMonthlyBadges, listMembers } from "../api";
import type { MonthlyBadge, PointsWinner } from "../api";
import { colorPreview, fallbackColorForUser, textColorForBackground } from "../utils/palette";
import { listApprovals } from "../api";

import { HouseholdSettingsCard } from "../components/settings/HouseholdSettingsCard";
import { ColorPickerCard } from "../components/settings/ColorPickerCard";

export const SettingsPage = () => {
  const { token, user, logout } = useAuth();
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

  useEffect(() => {
    const loadColor = async () => {
      try {
        if (!token || !user?.id) return;
        const res = await listMembers(token);
        const me = res.members.find((m: any) => m._id === user.id);
        if (me?.color) setMemberColor(me.color);
      } catch {
        /* ignore */
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
    // Om baslinjen saknas men vi har data, synka så knappen startar grå
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

  return (
    <div
      className="shell home-shell"
      style={{
        ["--user-color" as any]: shellColor,
        ["--user-color-fg" as any]: shellColorFg,
        paddingTop: 0,
      }}
    >
      <header
        className="home-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#ffffff",
          padding: "0",
          marginBottom: "12px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div className="home-left">
          <nav className="nav-links">
            <Link to="/dashboard#kalender" className="nav-link subtle">
              Kalender
            </Link>
            <Link to="/dashboard#godkannanden" className="nav-link subtle">
              Godkännanden
              {approvalCount > 0 && <span className="nav-badge">{approvalCount}</span>}
            </Link>
            <Link to="/dashboard#sysslor" className="nav-link subtle">
              Sysslor
            </Link>
            <Link to="/dashboard#statistik" className="nav-link subtle">
              Statistik
            </Link>
            {mode === "competition" && (
              <Link to="/dashboard#priser" className="nav-link subtle">
                Priser
              </Link>
            )}
          </nav>
        </div>
        <div className="header-actions" style={{ gap: 8, justifyContent: "flex-end", marginLeft: "auto" }}>
          <Link to="/settings" className="nav-link subtle active" style={{ marginRight: 4 }}>
            Inställningar
          </Link>
          <button
            className="logout-btn"
            onClick={logout}
            style={{ background: shellColor, color: shellColorFg, border: "none" }}
          >
            Logga ut
          </button>
        </div>
      </header>

    <div className="settings-hero-grid">
      <div className="settings-card glass hero-left-card">
        <h2>Hushåll: {name || "Hushåll"}</h2>
        <p className="hint">
          Medlemmar ({memberCount}): {memberNames || "–"}
        </p>
        <div className="hero-code">
          <span className="hint">Inbjudningskod:</span>
          <span className="invite-pill">{invite || "–"}</span>
        </div>

        <div className="color-picker-hero">
          <ColorPickerCard
            availableColors={availableColors}
            colorLabels={colorLabels}
            usedColors={usedColors.filter((c): c is string => Boolean(c))}
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
            onSave={async (c) => {
              await handleColor(c);
              await handleUpdateHousehold();
              setEditingRules(false);
              setLastSavedRules(rulesText || "");
              setLastSavedColor(c);
            }}
            saving={updatingHousehold}
          />
        </div>
      </div>
      <div className="settings-card glass hero-extra-card">
        <img src="/figure/insallningar.png" alt="Inställningar" loading="lazy" />
      </div>
      <div className="settings-card glass hero-mode-card">
        <h3>Välj hushållsläge</h3>
        <p className="hint">
          <strong>Tävling:</strong> samla poäng, tävla om badges och se veckans vinnare.
          <br />
          <strong>Rättvisa:</strong> fokusera på att dela upp insatsen i procent per person så att alla bidrar jämnt.
          <br />
          Du kan byta läge när ni vill men läget styr hur statistiken, badges och mål räknas.
        </p>
        <div className="mode-actions">
          <button
            type="button"
            className="save-colors-btn"
            style={{ background: "var(--user-color, #0f172a)", color: "var(--user-color-fg, #ffffff)" }}
            onClick={handleUpdateHousehold}
            disabled={updatingHousehold}
          >
            {updatingHousehold ? "Sparar..." : "Spara"}
          </button>
        </div>
        <div className="mode-toggle">
          <button type="button" className={mode === "competition" ? "active" : ""} onClick={() => setMode("competition")}>
            Tävling
          </button>
          <button type="button" className={mode === "equality" ? "active" : ""} onClick={() => setMode("equality")}>
            Rättvisa
          </button>
        </div>
      </div>
    </div>

    <div className="settings-grid">
      {mode === "equality" && (
        <div className="settings-card glass household-card">
          <HouseholdSettingsCard
            name={name}
            mode={mode}
            prize={prize}
            members={members}
            targetShares={targetShares}
            updatingHousehold={updatingHousehold}
            setName={setName}
            setPrize={setPrize}
            setTargetShareForMember={setTargetShareForMember}
            handleUpdateHousehold={handleUpdateHousehold}
          />
        </div>
      )}

      {mode === "competition" && (
        <div className="settings-card glass prize-card">
          <h3>Priser</h3>
          <p className="hint">
            Frivilligt: lämna tomt om ni inte kör med egna priser. Belöningen går automatiskt till den med flest poäng för perioden (vecka/månad/år).
          </p>
          <div className="prize-row">
            <label>
              Veckans pris
              <input
                type="text"
                maxLength={200}
                value={prize}
                onChange={(e) => setPrize(e.target.value.slice(0, 200))}
                placeholder="Ex: Välj film, middag, etc."
              />
            </label>
            <label>
              Månadens pris
              <input
                type="text"
                maxLength={200}
                value={monthPrize}
                onChange={(e) => setMonthPrize(e.target.value.slice(0, 200))}
                placeholder="Ex: Välj aktivitet, upplevelse, etc."
              />
            </label>
            <label>
              Årets pris
              <input
                type="text"
                maxLength={200}
                value={yearPrize}
                onChange={(e) => setYearPrize(e.target.value.slice(0, 200))}
                placeholder="Ex: Resa, större överraskning, etc."
              />
            </label>
          </div>
          <div className="color-actions">
            <button
              type="button"
              className="save-colors-btn"
              style={{ background: "var(--user-color, #0f172a)", color: "var(--user-color-fg, #ffffff)" }}
              onClick={handleUpdateHousehold}
              disabled={updatingHousehold}
            >
              {updatingHousehold ? "Sparar..." : "Spara"}
            </button>
          </div>
        </div>
      )}

      {mode === "competition" && (
        <>
          <div className="settings-card glass badges-panel">
            <div className="badge-section">
              <p className="eyebrow">Special Badge</p>
              {badgeError && <p className="status error">{badgeError}</p>}
              {!badgeError && myChoreBadges.length === 0 && <p className="hint">Inga vunna specialbadges ännu.</p>}
              {!badgeError && myChoreBadges.length > 0 && (
                <div className="badge-thumb-grid">
                  {myChoreBadges.map((b) => (
                    <figure key={b.slug} className="badge-thumb">
                      {b.image && <img src={b.image} alt={b.title} loading="lazy" />}
                      <figcaption className="hint">{b.title}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="settings-card glass badges-panel">
            <div className="badge-section">
              <p className="eyebrow">Månadens badge</p>
              {badgeError && <p className="status error">{badgeError}</p>}
              {renderMonthlyBadge(latestMonthKey, monthPointsWinner, myId)}
            </div>
          </div>
        </>
      )}
    </div>
    </div>
  );
};

function renderMonthlyBadge(latestMonthKey: string | null, monthPointsWinner: PointsWinner | null, myId?: string) {
  if (!latestMonthKey || !monthPointsWinner) {
    return <p className="hint">Ingen vinnare ännu för den senaste avslutade månaden.</p>;
  }
  const isWinner = monthPointsWinner.userId === myId;
  if (!isWinner) {
    return <p className="hint">Den senaste månaden vanns av någon annan.</p>;
  }
  const monthIndex = (() => {
    const [, month] = latestMonthKey.split("-");
    const num = Number(month) - 1;
    return Number.isFinite(num) && num >= 0 && num < 12 ? num : null;
  })();
  const monthImages = [
    "/month/januari.png",
    "/month/februari.png",
    "/month/mars.png",
    "/month/april.png",
    "/month/maj.png",
    "/month/juni.png",
    "/month/juli.png",
    "/month/augusti.png",
    "/month/september.png",
    "/month/oktober.png",
    "/month/november.png",
    "/month/december.png",
  ];
  const src = monthIndex !== null ? monthImages[monthIndex] : undefined;
  return (
    <div className="badge-thumb-grid">
      <figure className="badge-thumb">
        {src ? <img src={src} alt="Månadens badge" loading="lazy" /> : <span className="hint">Månadens badge</span>}
      </figure>
    </div>
  );
}
