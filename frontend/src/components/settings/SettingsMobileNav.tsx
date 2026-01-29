import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

type SettingsMobileNavProps = {
  navItems: NavItem[];
  approvalCount: number;
  logout: () => void;
  shellColor: string;
  shellColorFg: string;
};

export const SettingsMobileNav = ({
  navItems,
  approvalCount,
  logout,
  shellColor,
  shellColorFg,
}: SettingsMobileNavProps) => {
  const navigate = useNavigate();

  return (
    <>
      <nav className="bottom-nav" aria-label="Mobilmeny">
        <div className="bottom-nav-grid">
          {navItems.map((item) => (
            <button key={item.id} aria-label={item.label} onClick={() => navigate(`/dashboard#${item.id}`)}>
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
      </nav>

      <div className="mobile-logout">
        <button
          className="logout-btn"
          onClick={logout}
          style={{ background: shellColor, color: shellColorFg, border: "none" }}
        >
          Logga ut
        </button>
      </div>
    </>
  );
};
