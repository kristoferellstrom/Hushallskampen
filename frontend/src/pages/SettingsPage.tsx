import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHousehold } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

export const SettingsPage = () => {
  const { token } = useAuth();
  const [invite, setInvite] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadInvite();
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
        <h2>Invite-kod</h2>
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
    </div>
  );
};
