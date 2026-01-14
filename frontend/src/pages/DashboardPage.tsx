import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { colorPreview, textColorForBackground, fallbackColorForUser } from "../utils/palette";
import { getHousehold } from "../api";

export const DashboardPage = () => {
  const { user, logout, token } = useAuth();
  const [householdName, setHouseholdName] = useState("");

  const loadHousehold = async () => {
    if (!token) return;
    try {
      const res = await getHousehold(token);
      if (res.household) {
        setHouseholdName(res.household.name);
      }
    } catch (err) {}};

  useEffect(() => {
    loadHousehold();
  }, [token]);
  
  const navColor = (() => {
    const c = user?.color;
    if (!c) return "#e2e8f0";
    if (c.startsWith("#")) return c;
    const preview = colorPreview(c);
    return preview || fallbackColorForUser(user?.id || "");
  })();
  const navText = textColorForBackground(navColor);

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
        <div className="card" style={{ background: navColor, color: navText }}>
          <h2>Navigering</h2>
          <ul className="list nav-links">
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
      </div>
    </div>
  );
};
