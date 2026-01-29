import { Link, useNavigate } from "react-router-dom";
import { assetUrl } from "../../utils/imageUtils";

type SettingsHeaderProps = {
  mode: string;
  approvalCount: number;
  logout: () => void;
  shellColor: string;
  shellColorFg: string;
};

export const SettingsHeader = ({
  mode,
  approvalCount,
  logout,
  shellColor,
  shellColorFg,
}: SettingsHeaderProps) => {
  const navigate = useNavigate();

  return (
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
          <Link to="/dashboard#kalender" className="nav-link subtle">
            Kalender
          </Link>
          <Link to="/dashboard#godkannanden" className="nav-link subtle">
            Godkännanden
            {approvalCount > 0 && <span className="nav-badge">{approvalCount}</span>}
          </Link>
          <Link to="/dashboard#sysslor" className="nav-link subtle">
            Sysslor
          </Link>
          <Link to="/dashboard#statistik" className="nav-link subtle">
            Statistik
          </Link>
          {mode === "competition" && (
            <Link to="/dashboard#priser" className="nav-link subtle">
              Priser
            </Link>
          )}
        </nav>
      </div>
      <div className="header-actions" style={{ gap: 8, justifyContent: "flex-end", marginLeft: "auto" }}>
        <Link
          to="/settings"
          className="nav-link subtle active settings-link"
          style={{ marginRight: 4 }}
          onClick={(e) => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (window.matchMedia("(max-width: 1366px)").matches) {
              e.preventDefault();
              navigate("/dashboard#kalender");
            }
          }}
        >
          <img
            className="settings-icon"
            src={assetUrl("/mob/setting_icon_mob.svg")}
            alt="Inställningar"
            aria-hidden="true"
            decoding="async"
            width="22"
            height="22"
          />
          <span className="settings-label">Inställningar</span>
        </Link>
        <button
          className="logout-btn"
          onClick={logout}
          style={{ background: shellColor, color: shellColorFg, border: "none" }}
        >
          Logga ut
        </button>
      </div>
    </header>
  );
};
