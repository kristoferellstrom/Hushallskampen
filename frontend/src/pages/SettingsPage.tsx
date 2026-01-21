import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useSettingsPage } from "../hooks/useSettingsPage";

import { InviteCard } from "../components/settings/InviteCard";
import { HouseholdSettingsCard } from "../components/settings/HouseholdSettingsCard";
import { ColorPickerCard } from "../components/settings/ColorPickerCard";

export const SettingsPage = () => {
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
  const earnedMonthlyBadges: string[] = []; 
  const earnedSpecialBadges: string[] = []; 

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
            {earnedMonthlyBadges.length > 0 ? (
              <div className="badge-thumb-grid">
                {earnedMonthlyBadges.map((src) => (
                  <figure key={src} className="badge-thumb">
                    <img src={src} alt="Badge" />
                  </figure>
                ))}
              </div>
            ) : (
              <p className="hint">Inga vunna månadsbadges ännu.</p>
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
