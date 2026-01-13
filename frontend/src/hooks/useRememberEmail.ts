import { useEffect, useState } from "react";

const KEY = "hk_last_email";

export const useRememberEmail = () => {
  const [email, setEmail] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      setEmail(saved);
      setRememberEmail(true);
    }
  }, []);

  const persist = (emailToSave: string) => {
    if (rememberEmail) {
      localStorage.setItem(KEY, emailToSave);
    } else {
      localStorage.removeItem(KEY);
    }
  };

  return {
    email,
    setEmail,
    rememberEmail,
    setRememberEmail,
    persist,
  };
};
