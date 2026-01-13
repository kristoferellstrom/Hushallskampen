type Member = { _id: string; name: string };

type Props = {
  name: string;
  mode: "competition" | "equality";
  prize: string;
  rulesText: string;
  approvalTimeout?: number;
  members: Member[];
  targetShares: Record<string, number>;

  updatingHousehold: boolean;
  status: string;
  error: string;
  invite: string;

  setName: (v: string) => void;
  setMode: (v: "competition" | "equality") => void;
  setPrize: (v: string) => void;
  setRulesText: (v: string) => void;
  setApprovalTimeout: (v: number | undefined) => void;

  setTargetShareForMember: (memberId: string, value: string) => void;
  handleUpdateHousehold: () => void;
};

export const HouseholdSettingsCard = ({
  name,
  mode,
  prize,
  rulesText,
  approvalTimeout,
  members,
  targetShares,
  updatingHousehold,
  status,
  error,
  invite,
  setName,
  setMode,
  setPrize,
  setRulesText,
  setApprovalTimeout,
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

      <div className="mode-toggle" style={{ marginTop: 8, marginBottom: 8 }}>
        <button type="button" className={mode === "competition" ? "active" : ""} onClick={() => setMode("competition")}>
          Tävling
        </button>
        <button type="button" className={mode === "equality" ? "active" : ""} onClick={() => setMode("equality")}>
          Rättvisa
        </button>
      </div>

      <label>
        Veckans pris
        <input
          type="text"
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
          placeholder="Ex: Välj film, middag, etc."
        />
      </label>

      <label>
        Hushållsregler
        <textarea
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
          rows={3}
          placeholder="Vad räknas som godkänt? Hur snabbt ska man granska? Vad händer vid avslag?"
        />
      </label>

      <label>
        Auto-approve/påminnelse (timmar)
        <input
          type="number"
          min={0}
          max={168}
          value={approvalTimeout ?? ""}
          onChange={(e) => setApprovalTimeout(e.target.value === "" ? undefined : Number(e.target.value))}
          placeholder="0 = av, 24 = en dag"
        />
        <p className="hint">Sparas som hushållsinställning (kan användas för auto-approve/påminnelser i nästa steg).</p>
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
