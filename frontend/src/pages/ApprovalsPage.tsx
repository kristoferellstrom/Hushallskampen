import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listApprovalHistory, listApprovals, reviewApproval } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

type Approval = {
  _id: string;
  submittedByUserId: { _id: string; name: string; email: string };
  reviewedByUserId?: { _id: string; name: string; email: string };
  status?: string;
  comment?: string;
  createdAt?: string;
  calendarEntryId: {
    _id: string;
    date: string;
    status: string;
    assignedToUserId: { _id: string; name: string; email: string };
    choreId: { _id: string; title: string; defaultPoints: number };
  };
};

type Props = { embedded?: boolean };

export const ApprovalsPage = ({ embedded = false }: Props) => {
  const { token } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [history, setHistory] = useState<Approval[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});

  const quickComments = ["Bra jobbat 💪", "Behöver göras om", "Ok men slarvigt"];

  const load = async () => {
    if (!token) return;
    setStatus("Laddar...");
    setError("");
    try {
      const res = await listApprovals(token);
      setApprovals(res.approvals);
      setStatus(`Att granska: ${res.approvals.length}`);
      const hist = await listApprovalHistory(token, 10);
      setHistory(hist.approvals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta godkännanden");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handle = async (id: string, action: "approve" | "reject") => {
    if (!token) return;
    const comment = comments[id];
    setLoading(true);
    setError("");
    try {
      await reviewApproval(token, id, action, comment);
      setStatus(action === "approve" ? "Godkände" : "Avslog");
      setComments((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera");
    } finally {
      setLoading(false);
    }
  };

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
                <strong>{a.calendarEntryId.choreId.title}</strong> · {a.calendarEntryId.choreId.defaultPoints}p
                <p className="hint">Av: {a.submittedByUserId.name}</p>
                <p className="hint">Tilldelad: {a.calendarEntryId.assignedToUserId.name}</p>
                <p className="hint">Datum: {a.calendarEntryId.date.slice(0, 10)}</p>
                <div className="chips">
                  {quickComments.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="chip"
                      onClick={() => setComments((prev) => ({ ...prev, [a._id]: c }))}
                      disabled={loading}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Lägg till kommentar (valfritt)"
                  value={comments[a._id] || ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [a._id]: e.target.value }))}
                  disabled={loading}
                />
              </div>
              <div className="actions">
                <button type="button" disabled={loading} onClick={() => handle(a._id, "approve")}>
                  Godkänn
                </button>
                <button type="button" disabled={loading} onClick={() => handle(a._id, "reject")}>
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
                <strong>
                  {h.calendarEntryId.choreId.title} · {h.calendarEntryId.choreId.defaultPoints}p
                </strong>
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
