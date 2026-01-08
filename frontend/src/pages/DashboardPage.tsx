import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getHousehold, listMembers, updateColor } from "../api/client";
import { colorPreview } from "../utils/palette";

export const DashboardPage = () => {
  const { user, logout, token } = useAuth();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Array<{ _id: string; name: string; color?: string }>>([]);

  const availableColors = ["blue", "green", "red", "orange", "purple", "pink", "yellow", "teal"];

  const loadCode = async () => {
    setStatus("");
    setError("");
    try {
      if (!token) throw new Error("Ingen token");
      const res = await getHousehold(token);
      if (!res.household) {
        setStatus("Du har inget hushåll");
        setCode("");
      } else {
        setCode(res.household.inviteCode);
        setStatus("Invite-kod hämtad");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta kod");
    }
  };

  const loadMembers = async () => {
    if (!token) return;
    try {
      const res = await listMembers(token);
      setMembers(res.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta medlemmar");
    }
  };

  const handleColor = async (color: string) => {
    if (!token) return;
    setError("");
    setStatus("");
    try {
      await updateColor(token, color);
      setStatus("Färg uppdaterad");
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera färg");
    }
  };

  const usedColors = members.filter((m) => m.color).map((m) => m.color);
  const userColor = members.find((m) => m._id === user?.id)?.color || user?.color;

  return (
    <div className="shell">
      <header className="row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Hej {user?.name || user?.email}</h1>
          <p className="hint">Hushåll: {user?.householdId ? user.householdId : "Inget ännu"}</p>
        </div>
        <button onClick={logout}>Logga ut</button>
      </header>

      <div className="grid">
        <div className="card">
          <h2>Navigation</h2>
          <ul className="list">
            <li>
              <Link to="/chores">Chore library</Link>
            </li>
            <li>
              <Link to="/calendar">Kalender</Link>
            </li>
            <li>
              <Link to="/approvals">Approvals</Link>
            </li>
            <li>
              <Link to="/stats">Stats</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
          </ul>
        </div>
        <div className="card">
          <h2>Invite-kod</h2>
          <p className="hint">Dela denna kod med andra i hushållet</p>
          <button onClick={loadCode}>Hämta kod</button>
          {code && (
            <p className="status ok" aria-live="polite">
              {code}
            </p>
          )}
          {status && !code && <p className="hint">{status}</p>}
          {error && (
            <p className="status error" aria-live="assertive">
              {error}
            </p>
          )}
        </div>

        <div className="card">
          <h2>Välj din färg</h2>
          <p className="hint">En färg per person i hushållet</p>
          <button onClick={loadMembers}>Hämta medlemmar</button>
          <div className="color-grid">
            {availableColors.map((c) => {
              const taken = usedColors.includes(c);
              const isMine = userColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${isMine ? "selected" : ""}`}
                  style={{ background: colorPreview(c) }}
                  disabled={taken && !isMine}
                  onClick={() => handleColor(c)}
                >
                  {c}
                </button>
              );
            })}
          </div>
          {userColor && <p className="hint">Din färg: {userColor}</p>}
          {usedColors.length > 0 && (
            <p className="hint">Upptagna: {usedColors.filter(Boolean).join(", ")}</p>
          )}
        </div>
      </div>
    </div>
  );
};
