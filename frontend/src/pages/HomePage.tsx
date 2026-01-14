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
    <div className="shell" style={{ ["--user-color" as any]: userColor, ["--user-color-fg" as any]: activeFg }}>
      <header
        className="home-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(241, 245, 249, 0.92)",
          paddingBottom: "10px",
          marginBottom: "12px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div className="home-left">
          <h1>Hej {user?.name || user?.email}</h1>
          <nav className="nav-links">
            <a
              href="#kalender"
              className={`nav-link ${selected === "kalender" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId("kalender");
              }}
            >
              Kalender
            </a>{" "}
            ·{" "}
            <a
              href="#sysslor"
              className={`nav-link ${selected === "sysslor" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId("sysslor");
              }}
            >
              Sysslor
            </a>{" "}
            ·{" "}
            <a
              href="#godkannanden"
              className={`nav-link ${selected === "godkannanden" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId("godkannanden");
              }}
            >
              Godkännanden
            </a>{" "}
            ·{" "}
            <a
              href="#statistik"
              className={`nav-link ${selected === "statistik" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId("statistik");
              }}
            >
              Statistik
            </a>
          </nav>
        </div>
        <div className="header-logo-large">
          <Logo />
        </div>
        <div className="header-actions">
          <Link to="/settings" className="nav-link" style={{ marginRight: 8 }}>
            Inställningar
          </Link>
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
