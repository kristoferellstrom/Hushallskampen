import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChoresPage } from "./ChoresPage";
import { CalendarPage } from "./CalendarPage";
import { ApprovalsPage } from "./ApprovalsPage";
import { StatsPage } from "./StatsPage";
import { AchievementsPage } from "./AchievementsPage";
import { colorPreview, fallbackColorForUser, textColorForBackground } from "../utils/palette";
import { useEffect, useState } from "react";
import { listMembers, listApprovals, getHousehold } from "../api";
import { mobileNavItems } from "../components/MobileNavIcons";

export const HomePage = () => {
  const { user, token, logout } = useAuth();
  const [selected, setSelected] = useState<string>("kalender");
  const [memberColor, setMemberColor] = useState<string | undefined>(() => localStorage.getItem("hk_user_color") || undefined);
  const [approvalCount, setApprovalCount] = useState<number>(0);
  const [householdMode, setHouseholdMode] = useState<"competition" | "equality">(
    () => (localStorage.getItem("householdMode") === "equality" ? "equality" : "competition"),
  );
  const showPrizes = householdMode !== "equality";
  const sectionIds = showPrizes ? ["kalender", "sysslor", "godkannanden", "statistik", "priser"] : ["kalender", "sysslor", "godkannanden", "statistik"];
  const navItems = mobileNavItems(showPrizes);

  useEffect(() => {
    const loadColor = async () => {
      try {
        if (!token || !user?.id) return;
        const res = await listMembers(token);
        const me = res.members.find((m: any) => m._id === user?.id);
        if (me?.color) setMemberColor(me.color);
      } catch {
   
      }
    };
    loadColor();
  }, [token, user?.id, user?.color]);

  useEffect(() => {
    const loadApprovals = async () => {
      try {
        if (!token) return;
        const res = await listApprovals(token);
        const mine = user?.id;
        const pendingForMe = res.approvals.filter((a: any) => a.submittedByUserId?._id !== mine);
        setApprovalCount(pendingForMe.length || 0);
      } catch {
        setApprovalCount(0);
      }
    };
    loadApprovals();
  }, [token, user?.id]);

  useEffect(() => {
    const loadHousehold = async () => {
      try {
        if (!token) return;
        const res = await getHousehold(token);
        const mode = res.household?.mode === "equality" ? "equality" : "competition";
        setHouseholdMode(mode);
        localStorage.setItem("householdMode", mode);
        if (mode === "equality") {
          setSelected((prev) => (prev === "priser" ? "kalender" : prev));
        }
      } catch {
        const mode = localStorage.getItem("householdMode") === "equality" ? "equality" : "competition";
        setHouseholdMode(mode);
      }
    };
    loadHousehold();
  }, [token]);

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
        const offset = Math.abs(rect.top - 120);
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
    <div className="shell home-shell" style={{ ["--user-color" as any]: userColor, ["--user-color-fg" as any]: activeFg }}>
      <header
        className="home-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#ffffff",
          padding: "0",
          marginBottom: "12px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div className="home-left">
          <nav className="nav-links">
            <a
              href="#kalender"
              className={`nav-link subtle ${selected === "kalender" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId("kalender");
              }}
            >
              Kalender
            </a>
            <a
              href="#godkannanden"
              className={`nav-link subtle ${selected === "godkannanden" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId("godkannanden");
              }}
            >
              Godkännanden
              {approvalCount > 0 && <span className="nav-badge">{approvalCount}</span>}
            </a>
            <a
              href="#sysslor"
              className={`nav-link subtle ${selected === "sysslor" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId("sysslor");
              }}
            >
              Sysslor
            </a>
            <a
              href="#statistik"
              className={`nav-link subtle ${selected === "statistik" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId("statistik");
              }}
            >
              Statistik
            </a>
            {showPrizes && (
              <a
                href="#priser"
                className={`nav-link subtle ${selected === "priser" ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("priser");
                }}
              >
                Priser
              </a>
            )}
          </nav>
        </div>
        <div className="header-actions">
          <Link to="/settings" className="nav-link settings-link" style={{ marginRight: 8 }}>
            <img className="settings-icon" src="/mob/setting_icon_mob.svg" alt="" aria-hidden="true" decoding="async" />
            <span className="settings-label">Inställningar</span>
          </Link>
          <button
            className="logout-btn"
            onClick={logout}
            style={{ background: userColor, color: activeFg, border: "none" }}
          >
            Logga ut
          </button>
        </div>
      </header>

      <div className="page-section">
        <CalendarPage embedded />
      </div>
      <div className="page-section">
        <ApprovalsPage embedded />
      </div>
      <div className="page-section">
        <ChoresPage embedded />
      </div>
      <div className="page-section">
        <StatsPage embedded />
      </div>
      {showPrizes && (
        <div className="page-section">
          <AchievementsPage embedded />
        </div>
      )}

      {/* Mobilz */}
      <div className="bottom-nav" aria-label="Mobilmeny">
        <div className="bottom-nav-grid">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={selected === item.id ? "active" : ""}
              aria-label={item.label}
              onClick={() => scrollToId(item.id)}
            >
              <span className="icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.id === "godkannanden" && approvalCount > 0 && (
                <span className="nav-badge" style={{ marginTop: 2 }}>
                  {approvalCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
