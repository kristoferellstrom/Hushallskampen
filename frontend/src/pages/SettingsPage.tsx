import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHousehold, listMembers, updateColor } from "../api/client";
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
  const [members, setMembers] = useState<Array<{ _id: string; name: string; color?: string }>>([]);

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
      } else {
        setInvite(res.household.inviteCode);
        setName(res.household.name);
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
