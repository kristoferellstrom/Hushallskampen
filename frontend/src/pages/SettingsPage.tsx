import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHousehold, listMembers, updateColor, updateHousehold } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { colorPreview } from "../utils/palette";

export const SettingsPage = () => {
  const { token, user } = useAuth();
  const [invite, setInvite] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [colorStatus, setColorStatus] = useState("");
  const [colorError, setColorError] = useState("");
  const [mode, setMode] = useState<"competition" | "equality">("competition");
  const [prize, setPrize] = useState("");
  const [updatingHousehold, setUpdatingHousehold] = useState(false);
  const [members, setMembers] = useState<Array<{ _id: string; name: string; color?: string }>>([]);
  const [rulesText, setRulesText] = useState("");
  const [approvalTimeout, setApprovalTimeout] = useState<number | undefined>(undefined);
  const [targetShares, setTargetShares] = useState<Record<string, number>>({});

  const availableColors = ["blue", "green", "red", "orange", "purple", "pink", "yellow", "teal"];
  const colorLabels: Record<string, string> = {
    blue: "Blå",
    green: "Grön",
    red: "Röd",
    orange: "Orange",
    purple: "Lila",
    pink: "Rosa",
    yellow: "Gul",
    teal: "Turkos",
  };

  const loadInvite = async () => {
    setStatus("");
    setError("");
    try {
      if (!token) throw new Error("Ingen token");
      const res = await getHousehold(token);
      if (!res.household) {
        setStatus("Du har inget hushåll");
        setInvite("");
        setName("");
        setMode("competition");
        setPrize("");
        setRulesText("");
        setApprovalTimeout(undefined);
      } else {
        setInvite(res.household.inviteCode);
        setName(res.household.name);
        setMode(res.household.mode || "competition");
        setPrize(res.household.weeklyPrizeText || "");
        setRulesText(res.household.rulesText || "");
        setApprovalTimeout(res.household.approvalTimeoutHours);
        if (res.household.targetShares) {
          const map: Record<string, number> = {};
          res.household.targetShares.forEach((t: any) => {
            map[t.userId] = t.targetPct;
          });
          setTargetShares(map);
        } else {
          setTargetShares({});
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta hushåll");
    }
  };

  const loadMembers = async () => {
    if (!token) return;
    setColorStatus("");
    setColorError("");
    try {
      const res = await listMembers(token);
      setMembers(res.members);
    } catch (err) {
      setColorError(err instanceof Error ? err.message : "Kunde inte hämta medlemmar");
    }
  };

  const handleColor = async (color: string) => {
    if (!token) return;
    setColorStatus("");
    setColorError("");
    try {
      await updateColor(token, color);
      setColorStatus("Färg uppdaterad");
      await loadMembers();
    } catch (err) {
      setColorError(err instanceof Error ? err.message : "Kunde inte uppdatera färg");
    }
  };

  const usedColors = members.filter((m) => m.color).map((m) => m.color);
  const userColor = members.find((m) => m._id === user?.id)?.color || user?.color;

  const handleUpdateHousehold = async () => {
    if (!token) return;
    setStatus("");
    setError("");
    setUpdatingHousehold(true);
    try {
      const targetList = members.map((m) => ({
        userId: m._id,
        targetPct: targetShares[m._id] !== undefined ? targetShares[m._id] : Math.round(100 / (members.length || 1)),
      }));
      await updateHousehold(token, { name, mode, weeklyPrizeText: prize, rulesText, approvalTimeoutHours: approvalTimeout, targetShares: targetList });
      setStatus("Hushållet uppdaterat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera hushåll");
    } finally {
      setUpdatingHousehold(false);
    }
  };

  const copyInvite = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite);
      setStatus("Koden kopierad");
    } catch {
      setStatus("Kunde inte kopiera koden");
    }
  };

  useEffect(() => {
    loadInvite();
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

      <div className="card">
        <h2>Inbjudningskod</h2>
        <p className="hint">Dela koden med de som ska gå med i hushållet</p>
        <button onClick={loadInvite}>Hämta kod</button>
        {invite && (
          <div className="invite-wrapper">
            <span className="invite-pill">{invite}</span>
            <button type="button" className="chip" onClick={copyInvite}>
              Kopiera
            </button>
          </div>
        )}
        {status && !invite && <p className="hint">{status}</p>}
        {error && (
          <p className="status error" aria-live="assertive">
            {error}
          </p>
        )}
      </div>

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
          <input type="text" value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="Ex: Välj film, middag, etc." />
        </label>
        <label>
          Hushållsregler
          <textarea value={rulesText} onChange={(e) => setRulesText(e.target.value)} rows={3} placeholder="Vad räknas som godkänt? Hur snabbt ska man granska? Vad händer vid avslag?" />
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
                onChange={(e) =>
                  setTargetShares((prev) => ({
                    ...prev,
                    [m._id]: e.target.value === "" ? undefined : Number(e.target.value),
                  }))
                }
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
    </div>
  );
};
