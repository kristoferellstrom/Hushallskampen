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

  handleColor: (c: string) => void;
};

export const ColorPickerCard = ({
  availableColors,
  colorLabels,
  usedColors,
  userColor,
  members,
  colorStatus,
  colorError,
  handleColor,
}: Props) => {
  return (
    <div className="card">
      <h2>Välj din färg</h2>
      <p className="hint">En färg per person i hushållet</p>

      <div className="color-grid">
        {availableColors.map((c) => {
          const taken = usedColors.includes(c);
          const isMine = userColor === c;
          const owner = members.find((m) => m.color === c);

          return (
            <button
              key={c}
              type="button"
              className={`color-swatch ${isMine ? "selected" : ""}`}
              style={{ background: colorPreview(c) }}
              disabled={taken && !isMine}
              onClick={() => handleColor(c)}
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

      {colorStatus && <p className="status ok">{colorStatus}</p>}
      {colorError && (
        <p className="status error" aria-live="assertive">
          {colorError}
        </p>
      )}
    </div>
  );
};
