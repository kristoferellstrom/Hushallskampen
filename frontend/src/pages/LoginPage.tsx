import type { Mode } from "../hooks/useAuthForm";
import { Logo } from "../components/Logo";
import "../styles/login.scss";
import "../styles/login.mobile.scss";
import "../styles/login.pwa.scss";

import { useRememberEmail } from "../hooks/useRememberEmail";
import { useAuthForm } from "../hooks/useAuthForm";
import { AuthModeToggle } from "../components/auth/AuthModeToggle";
import { AuthForm } from "../components/auth/AuthForm";
import { PwaInstallButton } from "../components/PwaInstallButton";

export const LoginPage = ({ mode: initialMode = "login" }: { mode?: Mode }) => {
  const remember = useRememberEmail();
  const authForm = useAuthForm(initialMode, remember.persist);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authForm.submit(remember.email);
  };

  return (
    <div className={`shell auth-shell ${authForm.mode}`}>
      <div className="auth-logo">
        <Logo />
      </div>

      <AuthModeToggle mode={authForm.mode} setMode={authForm.setMode} />

      <AuthForm
        mode={authForm.mode}
        name={authForm.name}
        setName={authForm.setName}
        email={remember.email}
        setEmail={remember.setEmail}
        password={authForm.password}
        setPassword={authForm.setPassword}
        rememberEmail={remember.rememberEmail}
        setRememberEmail={remember.setRememberEmail}
        loading={authForm.loading}
        status={authForm.status}
        error={authForm.error}
        onSubmit={handleSubmit}
      />

      <PwaInstallButton />
    </div>
  );
};
