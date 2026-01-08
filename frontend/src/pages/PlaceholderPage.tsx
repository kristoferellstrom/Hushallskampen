import { Link } from "react-router-dom";

export const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div className="shell">
      <header>
        <div>
          <p className="eyebrow">Kommer snart</p>
          <h1>{title}</h1>
          <p className="hint">Bygg denna vy enligt nästa steg i planen.</p>
        </div>
      </header>
      <div className="card">
        <p>Här kommer {title.toLowerCase()}-funktionalitet.</p>
        <Link to="/dashboard">Tillbaka till dashboard</Link>
      </div>
    </div>
  );
};
