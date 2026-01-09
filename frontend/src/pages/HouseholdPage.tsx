import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createHousehold, joinHousehold } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

export const HouseholdPage = () => {
  const { token, user, refreshUser } = useAuth();
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteCreated, setInviteCreated] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.householdId) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setStatus("");
    setError("");
    try {
      const res = await createHousehold(token, householdName);
      setInviteCreated(res.household.inviteCode);
      setStatus("Hushåll skapat");
      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skapa hushåll");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setStatus("");
    setError("");
    try {
      await joinHousehold(token, inviteCode);
      setStatus("Gick med i hushåll");
      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte gå med");
    }
  };

  return (
    <div className="shell">
      <Link className="back-link" to="/dashboard">
        ← Till dashboard
      </Link>
      <Logo />
      <header>
        <div>
          <p className="eyebrow">Hushåll</p>
          <h1>Skapa eller gå med</h1>
          <p className="hint">Du är inloggad som {user?.email}</p>
        </div>
      </header>

      <div className="grid">
        <form className="card" onSubmit={handleCreate}>
          <h2>Skapa hushåll</h2>
          <label>
            Namn
            <input value={householdName} onChange={(e) => setHouseholdName(e.target.value)} required />
          </label>
          <button type="submit">Skapa</button>
          {inviteCreated && (
            <p className="status ok" aria-live="polite">
              Inbjudningskod: <strong>{inviteCreated}</strong>
            </p>
          )}
        </form>

        <form className="card" onSubmit={handleJoin}>
          <h2>Gå med i hushåll</h2>
          <label>
            Inbjudningskod
            <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} required />
          </label>
          <button type="submit">Gå med</button>
        </form>
      </div>

      {status && (
        <p className="status ok" aria-live="polite">
          {status}
        </p>
      )}
      {error && (
        <p className="status error" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
};
