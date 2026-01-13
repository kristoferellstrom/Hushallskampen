import type { Mode } from "../../hooks/useAuthForm";

type Props = {
  mode: Mode;

  name: string;
  setName: (v: string) => void;

  email: string;
  setEmail: (v: string) => void;

  password: string;
  setPassword: (v: string) => void;

  rememberEmail: boolean;
  setRememberEmail: (v: boolean) => void;

  loading: boolean;
  status: string;
  error: string;

  onSubmit: (e: React.FormEvent) => void;
};

export const AuthForm = ({
  mode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  rememberEmail,
  setRememberEmail,
  loading,
  status,
  error,
  onSubmit,
}: Props) => {
  return (
    <form className="card auth-card" onSubmit={onSubmit}>
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

      <label className="inline remember">
        <input
          className="remember-checkbox"
          type="checkbox"
          checked={rememberEmail}
          onChange={(e) => setRememberEmail(e.target.checked)}
        />
        Kom ihåg e-post
      </label>

      <button type="submit" disabled={loading} className={`submit-btn ${mode}`}>
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
    </form>
  );
};
