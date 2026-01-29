import { ColorPickerCard } from "./ColorPickerCard";
import { buildWebpSrcSet, withWebpWidth } from "../../utils/imageUtils";

type Member = { _id: string; name: string; color?: string | null };

type SettingsHeroGridProps = {
  name: string;
  memberCount: number;
  memberNames: string;
  invite?: string;
  availableColors: string[];
  colorLabels: Record<string, string>;
  usedColors: Array<string | null | undefined>;
  userColor?: string | null;
  members: Member[];
  colorStatus: string;
  colorError: string;
  rulesText: string;
  onRulesChange: (v: string) => void;
  editingRules: boolean;
  onEditToggle: () => void;
  lastSavedRules: string;
  lastSavedColor?: string | null;
  initializedBaseline: boolean;
  onSaveColor: (color: string) => Promise<void> | void;
  updatingHousehold: boolean;
  mode: "competition" | "equality";
  setMode: (mode: "competition" | "equality") => void;
  saveDisabled: boolean;
  handleUpdateHousehold: () => void;
};

export const SettingsHeroGrid = ({
  name,
  memberCount,
  memberNames,
  invite,
  availableColors,
  colorLabels,
  usedColors,
  userColor,
  members,
  colorStatus,
  colorError,
  rulesText,
  onRulesChange,
  editingRules,
  onEditToggle,
  lastSavedRules,
  lastSavedColor,
  initializedBaseline,
  onSaveColor,
  updatingHousehold,
  mode,
  setMode,
  saveDisabled,
  handleUpdateHousehold,
}: SettingsHeroGridProps) => {
  return (
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
            onRulesChange={onRulesChange}
            editingRules={editingRules}
            onEditToggle={onEditToggle}
            lastSavedRules={lastSavedRules}
            lastSavedColor={lastSavedColor}
            initializedBaseline={initializedBaseline}
            onSave={onSaveColor}
            saving={updatingHousehold}
          />
        </div>
      </div>
      <div className="settings-card glass hero-extra-card">
        <img
          src={withWebpWidth("/figure/insallningar.webp", 800)}
          srcSet={buildWebpSrcSet("/figure/insallningar.webp", [400, 800], 1200)}
          sizes="(max-width: 900px) 80vw, 30vw"
          alt="Inställningar"
          loading="lazy"
          decoding="async"
          width="1200"
          height="800"
        />
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
        <div className="mode-toggle-row">
          <div className="mode-toggle">
            <button type="button" className={mode === "competition" ? "active" : ""} onClick={() => setMode("competition")}>
              Tävling
            </button>
            <button type="button" className={mode === "equality" ? "active" : ""} onClick={() => setMode("equality")}>
              Rättvisa
            </button>
          </div>
          <div className="mode-actions-inline">
            <button
              type="button"
              className="save-colors-btn"
              style={{
                background: saveDisabled ? "#cbd5e1" : "var(--user-color, #0f172a)",
                color: saveDisabled ? "#ffffff" : "var(--user-color-fg, #ffffff)",
              }}
              onClick={handleUpdateHousehold}
              disabled={saveDisabled}
            >
              {updatingHousehold ? "Sparar..." : "Spara"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
