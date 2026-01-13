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

      <InviteCard invite={invite} status={status} error={error} loadInvite={loadInvite} copyInvite={copyInvite} />

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
  );
};
