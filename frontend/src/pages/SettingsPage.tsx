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
    status,
    error,
    colorStatus,
    colorError,
    mode,
    prize,
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
    setRulesText,

    loadInvite,
    handleUpdateHousehold,
    copyInvite,
    handleColor,
    setTargetShareForMember,
  } = useSettingsPage();
  const [monthlyBadges, setMonthlyBadges] = useState<MonthlyBadge[]>([]);
  const [badgeError, setBadgeError] = useState("");
  const [monthPointsWinner, setMonthPointsWinner] = useState<PointsWinner | null>(null);
  const [yearPointsWinner, setYearPointsWinner] = useState<PointsWinner | null>(null);
  const earnedSpecialBadges: string[] = [];
  const [memberColor, setMemberColor] = useState<string | undefined>(undefined);
  const [approvalCount, setApprovalCount] = useState<number>(0);
  const [editingRules, setEditingRules] = useState(false);
  const [lastSavedRules, setLastSavedRules] = useState<string>("");
  const [lastSavedColor, setLastSavedColor] = useState<string | undefined>(undefined);
  const [initializedBaseline, setInitializedBaseline] = useState(false);

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
    if (!initializedBaseline && (userColor !== undefined || rulesText !== undefined)) {
      setLastSavedColor(userColor ?? "");
      setLastSavedRules(rulesText ?? "");
      setInitializedBaseline(true);
    }
  }, [initializedBaseline, userColor, rulesText]);

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
        setMonthlyBadges(res.badges || []);
        setMonthPointsWinner((res as any).monthPointsWinner || null);
        setYearPointsWinner((res as any).yearPointsWinner || null);
        setBadgeError("");
      } catch (err) {
        setBadgeError(err instanceof Error ? err.message : "Kunde inte hämta badges");
      }
    };
    load();
  }, [token]);

  const myId = user?.id;
  const myMonthlyBadges = monthlyBadges.filter((b) => b.winners.some((w) => w.userId === myId && w.wins > 0));
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
            <Link to="/dashboard#priser" className="nav-link subtle">
              Priser
            </Link>
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
        <div className="settings-card glass hero-right-card">
          <img src="/figure/insallningar.png" alt="Inställningar" loading="lazy" />
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card glass household-card">
          <HouseholdSettingsCard
            name={name}
            mode={mode}
            prize={prize}
            members={members}
            targetShares={targetShares}
            updatingHousehold={updatingHousehold}
            status={status}
            error={error}
            invite={invite}
            setName={setName}
            setMode={setMode}
            setPrize={setPrize}
            setTargetShareForMember={setTargetShareForMember}
            handleUpdateHousehold={handleUpdateHousehold}
          />
        </div>

        <div className="settings-card glass badges-panel full-span">
          <div className="card-head">
            <p className="eyebrow">Badges</p>
            <h2>Dina priser</h2>
            <p className="hint">Badges du har tjänat syns här när de låses upp. Besök sidan Priser för full översikt.</p>
          </div>
          <div className="badge-section">
            <p className="eyebrow">Månadsbadges</p>
            {badgeError && <p className="status error">{badgeError}</p>}
            {!badgeError && myMonthlyBadges.length === 0 && <p className="hint">Inga vunna månadsbadges ännu.</p>}
            {!badgeError && myMonthlyBadges.length > 0 && (
              <div className="badge-thumb-grid">
                {myMonthlyBadges.map((b) => {
                  const win = b.winners.find((w) => w.userId === myId);
                  return (
                    <figure key={b.slug} className="badge-thumb badge-count">
                      {b.image && <img src={b.image} alt={b.title} loading="lazy" />}
                      {win && win.wins > 1 && <span className="badge-count-pill">{win.wins}</span>}
                      <figcaption>
                        <strong>{b.title}</strong>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
          </div>

          <div className="badge-section">
            <p className="eyebrow">Månadens poängvinnare</p>
            {badgeError && <p className="status error">{badgeError}</p>}
            {!badgeError && !monthPointsWinner && <p className="hint">Ingen vinnare ännu denna månad.</p>}
            {!badgeError && monthPointsWinner && (
              <div className="badge-thumb-grid">
                <figure className="badge-thumb">
                  <img src="/month/januari.png" alt="Månadens poängvinnare" loading="lazy" />
                  <figcaption style={{ textAlign: "center" }}>
                    <strong>{monthPointsWinner.name || "Okänd"}</strong>
                    <div className="hint" style={{ marginTop: 4 }}>{monthPointsWinner.points} poäng</div>
                  </figcaption>
                </figure>
              </div>
            )}
          </div>

          <div className="badge-section">
            <p className="eyebrow">Årsvinnare (poäng)</p>
            {badgeError && <p className="status error">{badgeError}</p>}
            {!badgeError && !yearPointsWinner && <p className="hint">Ingen årsvinnare ännu.</p>}
            {!badgeError && yearPointsWinner && (
              <div className="badge-thumb-grid">
                <figure className="badge-thumb">
                  <img src="/arsvinnaren.png" alt="Årsvinnaren" loading="lazy" />
                  <figcaption style={{ textAlign: "center" }}>
                    <strong>{yearPointsWinner.name || "Okänd"}</strong>
                    <div className="hint" style={{ marginTop: 4 }}>{yearPointsWinner.points} poäng</div>
                  </figcaption>
                </figure>
              </div>
            )}
          </div>

          <div className="badge-section">
            <p className="eyebrow">Specialbadges</p>
            {earnedSpecialBadges.length > 0 ? (
              <div className="badge-thumb-grid">
                {earnedSpecialBadges.map((src) => (
                  <figure key={src} className="badge-thumb">
                    <img src={src} alt="Badge" loading="lazy" />
                  </figure>
                ))}
              </div>
            ) : (
              <p className="hint">Inga vunna specialbadges ännu.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
