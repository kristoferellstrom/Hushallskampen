type Member = { _id: string; name: string };

type Props = {
  name: string;
  mode: "competition" | "equality";
  prize: string;
  members: Member[];
  targetShares: Record<string, number>;

  updatingHousehold: boolean;
  status: string;
  error: string;
  invite: string;

  setName: (v: string) => void;
  setMode: (v: "competition" | "equality") => void;
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
  status,
  error,
  invite,
  setName,
  setMode,
  setPrize,
  setTargetShareForMember,
  handleUpdateHousehold,
}: Props) => {
  return (
    <div className="card">
      <h2>Hushållets läge & pris</h2>

      <label>
        Namn
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label>
        Veckans pris
        <input
          type="text"
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
          placeholder="Ex: Välj film, middag, etc."
        />
      </label>

      <div>
        <h3>Målfördelning (%) per vecka</h3>
        {members.map((m) => (
          <label key={m._id}>
            {m.name}
            <input
              type="number"
              min={0}
              max={100}
              value={targetShares[m._id] ?? ""}
              onChange={(e) => setTargetShareForMember(m._id, e.target.value)}
              placeholder={`${Math.round(100 / (members.length || 1))}%`}
            />
          </label>
        ))}
        <p className="hint">Låt summan bli runt 100%. Lämna tomt för att auto-fördela lika.</p>
      </div>

      <button type="button" onClick={handleUpdateHousehold} disabled={updatingHousehold}>
        Spara inställningar
      </button>

      {status && invite && <p className="status ok">{status}</p>}

      {error && (
        <p className="status error" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
};
