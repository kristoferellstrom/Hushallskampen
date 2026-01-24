type Member = { _id: string; name: string; color?: string };

type Props = {
  name: string;
  mode: "competition" | "equality";
  prize: string;
  members: Member[];
  targetShares: Record<string, number>;

  updatingHousehold: boolean;

  setName: (v: string) => void;
  setPrize: (v: string) => void;

  setTargetShareForMember: (memberId: string, value: string) => void;
  handleUpdateHousehold: () => void;
};

export const HouseholdSettingsCard = ({
  name,
  mode,
  prize,
  members,
  targetShares,
  updatingHousehold,
  setName,
  setPrize,
  setTargetShareForMember,
  handleUpdateHousehold,
}: Props) => {
  return (
    <div className="card">
      {mode === "competition" && (
        <>
          <h2>Hushållets läge & pris</h2>

          <label>
            Namn
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        </>
      )}

      {mode === "competition" && (
        <label>
          Veckans pris
          <input
            type="text"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            placeholder="Ex: Välj film, middag, etc."
          />
        </label>
      )}

      <div className="target-share-grid">
        <div className="target-share-head">
          <h3>Målfördelning (%) per vecka</h3>
          <p className="hint">Låt summan bli runt 100%. Lämna tomt för att auto-fördela lika.</p>
        </div>
        <div className="target-row horizontal">
          {members.map((m) => (
            <div className="target-chip" key={m._id} style={{ ["--row-color" as any]: m.color }}>
              <span className="dot" aria-hidden="true" />
              <span className="name">{m.name}</span>
              <div className="target-input-wrap">
                <input
                  className="target-input"
                  type="number"
                  min={0}
                  max={100}
                  value={targetShares[m._id] ?? ""}
                  onChange={(e) => setTargetShareForMember(m._id, e.target.value)}
                  placeholder={`${Math.round(100 / (members.length || 1))}`}
                />
                <span className="suffix">%</span>
              </div>
            </div>
          ))}
        </div>
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
  );
};
