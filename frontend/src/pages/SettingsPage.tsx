import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useSettingsPage } from "../hooks/useSettingsPage";
import { useAuth } from "../context/AuthContext";
import { fetchMonthlyBadges } from "../api";
import type { MonthlyBadge, PointsWinner } from "../api";

import { InviteCard } from "../components/settings/InviteCard";
import { HouseholdSettingsCard } from "../components/settings/HouseholdSettingsCard";
import { ColorPickerCard } from "../components/settings/ColorPickerCard";

export const SettingsPage = () => {
  const { token, user } = useAuth();
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
    approvalTimeout,
    targetShares,

    availableColors,
    colorLabels,
    usedColors,
    userColor,

    setName,
    setMode,
    setPrize,
    setRulesText,
    setApprovalTimeout,

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

  return (
    <div className="shell">
      <Link className="back-link" to="/dashboard">
        ← Till dashboard
      </Link>

      <Logo />

      <header>
        <div>
          <p className="eyebrow">Inställningar</p>
          <h1>{name || "Hushåll"}</h1>
          <p className="hint">Hantera hushållsinformation</p>
        </div>
      </header>

      <div className="settings-grid">
        <div className="settings-card glass">
          <InviteCard invite={invite} status={status} error={error} loadInvite={loadInvite} copyInvite={copyInvite} />
        </div>

        <div className="settings-card glass">
          <HouseholdSettingsCard
            name={name}
            mode={mode}
            prize={prize}
            rulesText={rulesText}
            approvalTimeout={approvalTimeout}
            members={members}
            targetShares={targetShares}
            updatingHousehold={updatingHousehold}
            status={status}
            error={error}
            invite={invite}
            setName={setName}
            setMode={setMode}
            setPrize={setPrize}
            setRulesText={setRulesText}
            setApprovalTimeout={setApprovalTimeout}
            setTargetShareForMember={setTargetShareForMember}
            handleUpdateHousehold={handleUpdateHousehold}
          />
        </div>

        <div className="settings-card glass">
          <ColorPickerCard
            availableColors={availableColors}
            colorLabels={colorLabels}
            usedColors={usedColors.filter((c): c is string => Boolean(c))}
            userColor={userColor}
            members={members}
            colorStatus={colorStatus}
            colorError={colorError}
            handleColor={handleColor}
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
                      {b.image && <img src={b.image} alt={b.title} />}
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
                  <img src="/month/januari.png" alt="Månadens poängvinnare" />
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
                  <img src="/arsvinnaren.png" alt="Årsvinnaren" />
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
                    <img src={src} alt="Badge" />
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
