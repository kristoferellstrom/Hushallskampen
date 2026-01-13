import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
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
      </div>
    </div>
  );
};
