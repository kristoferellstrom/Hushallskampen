import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getHousehold, listMembers, updateColor } from "../api/client";
import { colorPreview } from "../utils/palette";

export const DashboardPage = () => {
  const { user, logout, token } = useAuth();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Array<{ _id: string; name: string; color?: string }>>([]);
  const [householdName, setHouseholdName] = useState("");

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

  const loadHousehold = async () => {
    if (!token) return;
    try {
      const res = await getHousehold(token);
      if (res.household) {
        setHouseholdName(res.household.name);
      }
    } catch (err) {
      // ignore; shown via loadCode if needed
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

  useEffect(() => {
    loadHousehold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="shell">
      <header className="row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Hej {user?.name || user?.email}</h1>
          <p className="hint">Hushåll: {householdName || "Inget ännu"}</p>
        </div>
        <button onClick={logout}>Logga ut</button>
      </header>

      <div className="grid">
        <div className="card">
          <h2>Navigering</h2>
          <ul className="list">
            <li>
              <Link to="/chores">Sysslor</Link>
            </li>
            <li>
              <Link to="/calendar">Kalender</Link>
            </li>
            <li>
              <Link to="/approvals">Godkännanden</Link>
            </li>
            <li>
              <Link to="/stats">Statistik</Link>
            </li>
            <li>
              <Link to="/settings">Inställningar</Link>
            </li>
          </ul>
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
                  {colorLabels[c] || c}
                </button>
              );
            })}
          </div>
          {userColor && <p className="hint">Din färg: {colorLabels[userColor] || userColor}</p>}
          {usedColors.length > 0 && (
            <p className="hint">
              Upptagna:{" "}
              {usedColors
                .filter(Boolean)
                .map((c) => colorLabels[c] || c)
                .join(", ")}
            </p>
          )}
          {status && <p className="status ok">{status}</p>}
          {error && (
            <p className="status error" aria-live="assertive">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
