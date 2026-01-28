import { useEffect, useState } from "react";
import { colorPreview } from "../../utils/palette";

type Member = { _id: string; name: string; color?: string | null };

type Props = {
  availableColors: string[];
  colorLabels: Record<string, string>;
  usedColors: string[];
  userColor?: string | null;
  members: Member[];

  colorStatus: string;
  colorError: string;

  rulesText: string;
  onRulesChange: (v: string) => void;
  onSave: (color: string) => Promise<void> | void;
  saving?: boolean;
  editingRules?: boolean;
  onEditToggle?: () => void;
  lastSavedRules: string;
  lastSavedColor?: string | null;
  initializedBaseline?: boolean;
};

export const ColorPickerCard = ({
  availableColors,
  colorLabels,
  usedColors,
  userColor,
  members,
  colorStatus,
  colorError,
  rulesText,
  onRulesChange,
  onSave,
  saving = false,
  editingRules = false,
  onEditToggle,
  lastSavedRules,
  lastSavedColor,
  initializedBaseline = false,
}: Props) => {
  const [selectedColor, setSelectedColor] = useState<string>(userColor || "");

  useEffect(() => {
    setSelectedColor(userColor || "");
  }, [userColor]);

  const handleSelect = (c: string) => {
    setSelectedColor(c);
  };

  const handleSaveClick = async () => {
    const colorToSave = selectedColor || userColor || "";
    if (colorToSave) {
      await onSave(colorToSave);
    }
  };

  const currentColor = selectedColor || userColor || "";
  const baseColor = (lastSavedColor ?? userColor ?? "") || "";
  const dirty =
    initializedBaseline &&
    (currentColor !== baseColor || (rulesText || "") !== (lastSavedRules || ""));

  const displayRules = () => {
    if (!rulesText) return "Inga regler satta ännu.";
    if (rulesText.length <= 300) return rulesText;
    return `${rulesText.slice(0, 300)}…`;
  };

  return (
    <div className="card">
      <h2>Välj din färg</h2>
      <p className="hint">En färg per person i hushållet</p>

      <div className="color-grid">
        {availableColors.map((c) => {
          const taken = usedColors.includes(c);
          const isMine = userColor === c;
          const isSelected = (selectedColor || userColor) === c;
          const owner = members.find((m) => m.color === c);

          return (
            <button
              key={c}
              type="button"
              className={`color-swatch ${isSelected ? "selected" : ""}`}
              style={{ background: colorPreview(c) }}
              disabled={taken && !isMine}
              onClick={() => handleSelect(c)}
              title={owner ? `Upptagen av ${owner.name}` : ""}
            >
              {colorLabels[c] || c}
            </button>
          );
        })}
      </div>

      <p className="hint">
        Valda färger:{" "}
        {members
          .filter((m) => m.color)
          .map((m) => `${colorLabels[m.color!] || m.color} (${m.name})`)
          .join(", ") || "Inga valda ännu"}
      </p>

      <div className="rules-display">
        <div className="rules-head">
          <h3>Hushållsregler</h3>
        </div>
        {editingRules ? (
          <textarea
            className="rules-editor"
            value={rulesText}
            onChange={(e) => onRulesChange(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Vad räknas som godkänt? Hur snabbt ska man granska? Vad händer vid avslag?"
          />
        ) : (
          <p
            className={`rules-text ${rulesText ? "" : "muted"}`}
            role="button"
            tabIndex={0}
            aria-label="Redigera hushållsregler"
            onClick={() => onEditToggle?.()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEditToggle?.();
              }
            }}
          >
            {displayRules()}
          </p>
        )}
      </div>

      <div className="color-actions">
        <button
          type="button"
          className="save-colors-btn"
          style={{
            background: dirty ? colorPreview(userColor || "#0f172a") : "#cbd5e1",
            color: dirty ? "#fff" : "#ffffff",
          }}
          onClick={handleSaveClick}
          disabled={saving || !dirty}
        >
          {saving ? "Sparar..." : "Spara"}
        </button>
      </div>

      {colorStatus && <p className="status ok">{colorStatus}</p>}
      {colorError && (
        <p className="status error" aria-live="assertive">
          {colorError}
        </p>
      )}
    </div>
  );
};
