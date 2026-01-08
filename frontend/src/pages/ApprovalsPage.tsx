import { useEffect, useState } from "react";
import { listApprovals, reviewApproval } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Approval = {
  _id: string;
  submittedByUserId: { _id: string; name: string; email: string };
  calendarEntryId: {
    _id: string;
    date: string;
    status: string;
    assignedToUserId: { _id: string; name: string; email: string };
    choreId: { _id: string; title: string; defaultPoints: number };
  };
};

export const ApprovalsPage = () => {
  const { token } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!token) return;
    setStatus("Laddar...");
    setError("");
    try {
      const res = await listApprovals(token);
      setApprovals(res.approvals);
      setStatus(`Pending: ${res.approvals.length}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta approvals");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handle = async (id: string, action: "approve" | "reject") => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await reviewApproval(token, id, action);
      setStatus(action === "approve" ? "Godkände" : "Avslog");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell">
      <header>
        <div>
          <p className="eyebrow">Approvals</p>
          <h1>Granska klara sysslor</h1>
          <p className="hint">Godkänn eller avvisa</p>
        </div>
      </header>

      <div className="card">
        <div className="row">
          {status && <p className="status ok">{status}</p>}
          {error && <p className="status error">{error}</p>}
        </div>
        <ul className="list">
          {approvals.map((a) => (
            <li key={a._id}>
              <div className="row">
                <div>
                  <strong>{a.calendarEntryId.choreId.title}</strong> · {a.calendarEntryId.choreId.defaultPoints}p
                  <p className="hint">Av: {a.submittedByUserId.name}</p>
                  <p className="hint">Tilldelad: {a.calendarEntryId.assignedToUserId.name}</p>
                  <p className="hint">Datum: {a.calendarEntryId.date.slice(0, 10)}</p>
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
          {approvals.length === 0 && <p className="hint">Inga pending just nu</p>}
        </ul>
      </div>
    </div>
  );
};
