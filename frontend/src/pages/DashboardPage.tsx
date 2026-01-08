import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getHousehold } from "../api/client";

export const DashboardPage = () => {
  const { user, logout, token } = useAuth();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
      </div>
    </div>
  );
};
