import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const DashboardPage = () => {
  const { user, logout } = useAuth();
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
      </div>
    </div>
  );
};
