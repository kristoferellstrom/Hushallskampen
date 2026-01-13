import type { Mode } from "../../hooks/useAuthForm";

type Props = {
  mode: Mode;
  setMode: (m: Mode) => void;
};

export const AuthModeToggle = ({ mode, setMode }: Props) => {
  return (
    <header className="auth-header">
      <div className="mode-toggle">
        <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
          Logga in
        </button>
        <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
          Registrera
        </button>
      </div>
    </header>
  );
};
