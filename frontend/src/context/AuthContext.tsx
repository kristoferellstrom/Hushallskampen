import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getMe, login, register as apiRegister } from "../api/client";

export type User = {
  id: string;
  name: string;
  email: string;
  householdId?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "hk_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const refreshUser = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getMe(token);
      setUser(res.user);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda användare");
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      setToken(res.token);
      localStorage.setItem(STORAGE_KEY, res.token);
      setUser(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inloggningen misslyckades");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRegister(name, email, password);
      setToken(res.token);
      localStorage.setItem(STORAGE_KEY, res.token);
      setUser(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registreringen misslyckades");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      login: handleLogin,
      register: handleRegister,
      logout,
      refreshUser,
    }),
    [user, token, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
