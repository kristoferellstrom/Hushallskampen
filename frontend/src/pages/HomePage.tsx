import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChoresPage } from "./ChoresPage";
import { CalendarPage } from "./CalendarPage";
import { ApprovalsPage } from "./ApprovalsPage";
import { StatsPage } from "./StatsPage";
import { Logo } from "../components/Logo";
import { colorPreview, fallbackColorForUser, textColorForBackground } from "../utils/palette";
import { useEffect, useState } from "react";
import { listMembers } from "../api";

export const HomePage = () => {
  const { user, token, logout } = useAuth();
  const [selected, setSelected] = useState<string>("kalender");
  const [memberColor, setMemberColor] = useState<string | undefined>(undefined);
  const sectionIds = ["kalender", "sysslor", "godkannanden", "statistik"];

  useEffect(() => {
    const loadColor = async () => {
      try {
        if (!token) return;
        const res = await listMembers(token);
        const me = res.members.find((m: any) => m._id === user.id);
        if (me?.color) setMemberColor(me.color);
      } catch {
        /* ignore */
      }
    };
    loadColor();
  }, [token, user?.id, user?.color]);

  const userColor = (() => {
    const c = memberColor || user?.color;
    if (!c) return fallbackColorForUser(user?.id || "");
    if (c.startsWith("#")) return c;
    const preview = colorPreview(c.toLowerCase());
    return preview || fallbackColorForUser(user?.id || "");
  })();
  const activeFg = textColorForBackground(userColor);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setSelected(id);
  };

  useEffect(() => {
    const handler = () => {
      let current = selected;
      let closest = Number.POSITIVE_INFINITY;
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const offset = Math.abs(rect.top - 120); // lite buffert under headern
        if (offset < closest) {
          closest = offset;
          current = id;
        }
      });
      if (current !== selected) setSelected(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [selected, sectionIds]);

  return (
    <div className="shell">
      <header
        className="home-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#f1f5f9",
          paddingBottom: "10px",
          marginBottom: "12px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div className="home-left">
          <h1>Hej {user?.name || user?.email}</h1>
          <nav style={{ background: "transparent", color: "#0f172a", padding: "0", borderRadius: "10px" }}>
            <a
              href="#kalender"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("kalender");
              }}
              style={{
                textDecoration: "none",
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: "10px",
                background: selected === "kalender" ? userColor : "transparent",
                color: selected === "kalender" ? activeFg : "#0f172a",
              }}
            >
              Kalender
            </a>{" "}
            ·{" "}
            <a
              href="#sysslor"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("sysslor");
              }}
              style={{
                textDecoration: "none",
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: "10px",
                background: selected === "sysslor" ? userColor : "transparent",
                color: selected === "sysslor" ? activeFg : "#0f172a",
              }}
            >
              Sysslor
            </a>{" "}
            ·{" "}
            <a
              href="#godkannanden"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("godkannanden");
              }}
              style={{
                textDecoration: "none",
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: "10px",
                background: selected === "godkannanden" ? userColor : "transparent",
                color: selected === "godkannanden" ? activeFg : "#0f172a",
              }}
            >
              Godkännanden
            </a>{" "}
            ·{" "}
            <a
              href="#statistik"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("statistik");
              }}
              style={{
                textDecoration: "none",
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: "10px",
                background: selected === "statistik" ? userColor : "transparent",
                color: selected === "statistik" ? activeFg : "#0f172a",
              }}
            >
              Statistik
            </a>{" "}
            ·{" "}
            <Link
              to="/settings"
              style={{
                textDecoration: "none",
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: "10px",
                background: "transparent",
                color: "#0f172a",
              }}
            >
              Inställningar
            </Link>
          </nav>
        </div>
        <div className="header-logo-large">
          <Logo />
        </div>
        <div className="header-actions">
          <button className="logout-btn" onClick={logout}>
            Logga ut
          </button>
        </div>
      </header>

      <CalendarPage embedded />
      <ChoresPage embedded />
      <ApprovalsPage embedded />
      <StatsPage embedded />
    </div>
  );
};
