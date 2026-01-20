import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useApprovalsPage } from "../hooks/useApprovalsPage";

type Props = { embedded?: boolean };

export const ApprovalsPage = ({ embedded = false }: Props) => {
  const { approvals, history, status, error, loading, comments, quickComments, setQuickComment, setComment, handleReview } = useApprovalsPage(10);

  const renderList = () => (
    <div className="card">
      <div className="row">
        {status && <p className="status ok">{status}</p>}
        {error && <p className="status error">{error}</p>}
      </div>
      <ul className="list">
        {approvals.map((a) => (
          <li key={a._id}>
            <div className="row" style={{ alignItems: "flex-start" }}>
              <div>
                <strong>{a.calendarEntryId.choreId?.title || "Syssla"}</strong> · {a.calendarEntryId.choreId?.defaultPoints ?? 0}p
                <p className="hint">Av: {a.submittedByUserId.name}</p>
                <p className="hint">Tilldelad: {a.calendarEntryId.assignedToUserId.name}</p>
                <p className="hint">Datum: {a.calendarEntryId.date.slice(0, 10)}</p>
                <div className="chips">
                  {quickComments.map((c) => (
                    <button key={c} type="button" className="chip" onClick={() => setQuickComment(a._id, c)} disabled={loading}>
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Lägg till kommentar (valfritt)"
                  value={comments[a._id] || ""}
                  onChange={(e) => setComment(a._id, e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="actions">
                <button type="button" disabled={loading} onClick={() => handleReview(a._id, "approve")}>
                  Godkänn
                </button>
                <button type="button" disabled={loading} onClick={() => handleReview(a._id, "reject")}>
                  Avvisa
                </button>
              </div>
            </div>
          </li>
        ))}
        {approvals.length === 0 && <p className="hint">Inga att granska just nu</p>}
      </ul>
    </div>
  );

  const renderHistory = () => (
    <div className="card">
      <div className="row">
        <div>
          <p className="eyebrow">Historik</p>
          <h3>Senaste granskningar</h3>
        </div>
      </div>
      <ul className="list compact">
        {history.map((h) => (
          <li key={h._id}>
            <div className="row" style={{ alignItems: "flex-start" }}>
              <div>
                <strong>{h.calendarEntryId.choreId?.title || "Syssla"} · {h.calendarEntryId.choreId?.defaultPoints ?? 0}p</strong>
                <p className="hint">
                  {h.status === "approved" ? "Godkänd" : "Avvisad"} · {h.calendarEntryId.date.slice(0, 10)}
                </p>
                <p className="hint">
                  Av: {h.submittedByUserId.name} · Granskad av: {h.reviewedByUserId?.name || "-"}
                </p>
                {h.comment && <p className="hint">Kommentar: {h.comment}</p>}
              </div>
            </div>
          </li>
        ))}
        {history.length === 0 && <p className="hint">Ingen historik ännu</p>}
      </ul>
    </div>
  );

  if (!embedded) {
    return (
      <div className="shell">
        <Link className="back-link" to="/dashboard">
          ← Till dashboard
        </Link>
        <Logo />
        <header>
          <div>
            <p className="eyebrow">Godkännanden</p>
            <h1>Granska klara sysslor</h1>
            <p className="hint">Godkänn eller avvisa med kommentar</p>
          </div>
        </header>
        {renderList()}
        {renderHistory()}
      </div>
    );
  }

  return (
    <section id="godkannanden">
      <header>
        <div>
          <p className="eyebrow">Godkännanden</p>
          <h2>Granska klara sysslor</h2>
          <p className="hint">Godkänn eller avvisa med kommentar</p>
        </div>
      </header>
      {renderList()}
      {renderHistory()}
    </section>
  );
};
