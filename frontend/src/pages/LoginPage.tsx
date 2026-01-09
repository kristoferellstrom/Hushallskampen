import { useState, useEffect } from "react";
import { Logo } from "../components/Logo";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";

export const LoginPage = ({ mode: initialMode = "login" }: { mode?: Mode }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const { login, register, loading } = useAuth();
  const [rememberEmail, setRememberEmail] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hk_last_email");
    if (saved) {
      setEmail(saved);
      setRememberEmail(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      const authed =
        mode === "login"
          ? await login(email, password)
          : await register(name, email, password);

      setStatus(mode === "login" ? "Inloggad" : "Registrerad och inloggad");

      if (rememberEmail) {
        localStorage.setItem("hk_last_email", email);
      } else {
        localStorage.removeItem("hk_last_email");
      }

      const hasHousehold = authed?.householdId;
      navigate(hasHousehold ? "/dashboard" : "/household", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    }
  };

  return (
    <div className="shell">
      <Logo />
      <header>
        <div>
          <p className="eyebrow">Hushållskampen</p>
          <h1>{mode === "login" ? "Logga in" : "Registrera"}</h1>
          <p className="hint">API: {import.meta.env.VITE_API_URL || "http://localhost:4000/api"}</p>
        </div>
        <div className="mode-toggle">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Logga in
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Registrera
          </button>
        </div>
      </header>

      <form className="card" onSubmit={handleSubmit}>
        {mode === "register" && (
          <label>
            Namn
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label>
          E-post
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Lösenord
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        <label className="inline">
          <input type="checkbox" checked={rememberEmail} onChange={(e) => setRememberEmail(e.target.checked)} /> Kom ihåg e-post
        </label>
        <button type="submit" disabled={loading}>
          {mode === "login" ? "Logga in" : "Registrera"}
        </button>
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
        <p className="hint">
          Ny? <Link to="/register">Skapa konto</Link> · Har konto? <Link to="/login">Logga in</Link>
        </p>
      </form>
    </div>
  );
};
