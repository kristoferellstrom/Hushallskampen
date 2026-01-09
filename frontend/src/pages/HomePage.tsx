import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChoresPage } from "./ChoresPage";
import { CalendarPage } from "./CalendarPage";
import { ApprovalsPage } from "./ApprovalsPage";
import { StatsPage } from "./StatsPage";
import { Logo } from "../components/Logo";

export const HomePage = () => {
  const { user, logout } = useAuth();

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="shell">
      <header className="home-header">
        <div className="home-left">
          <p className="eyebrow">Hushållskampen</p>
          <h1>Hej {user?.name || user?.email}</h1>
          <nav>
            <a
              href="#kalender"
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
              onClick={(e) => {
                e.preventDefault();
                scrollToId("statistik");
              }}
            >
              Statistik
            </a>{" "}
            · <Link to="/settings">Inställningar</Link>
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
