import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export type Mode = "login" | "register";

export const useAuthForm = (initialMode: Mode, persistEmail: (email: string) => void) => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const submit = async (email: string) => {
    setStatus("");
    setError("");
    try {
      const authed = mode === "login" ? await login(email, password) : await register(name, email, password);

      setStatus(mode === "login" ? "Inloggad" : "Registrerad och inloggad");
      persistEmail(email);

      const hasHousehold = authed?.householdId;
      navigate(hasHousehold ? "/dashboard" : "/household", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    }
  };

  return {
    mode,
    setMode,
    name,
    setName,
    password,
    setPassword,
    status,
    error,
    loading,
    submit,
  };
};
