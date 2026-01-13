import { useEffect, useMemo, useState } from "react";
import { listApprovalHistory, listApprovals, reviewApproval } from "../api";
import { useAuth } from "../context/AuthContext";

export type Approval = {
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

export const useApprovalsPage = (historyLimit = 10) => {
  const { token } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [history, setHistory] = useState<Approval[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});

  const quickComments = useMemo(() => ["Bra jobbat 💪", "Behöver göras om", "Ok men slarvigt"], []);

  const load = async () => {
    if (!token) return;
    setStatus("Laddar...");
    setError("");
    try {
      const res = await listApprovals(token);
      setApprovals(res.approvals);
      setStatus(`Att granska: ${res.approvals.length}`);
      const hist = await listApprovalHistory(token, historyLimit);
      setHistory(hist.approvals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta godkännanden");
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const setQuickComment = (approvalId: string, value: string) => {
    setComments((prev) => ({ ...prev, [approvalId]: value }));
  };

  const setComment = (approvalId: string, value: string) => {
    setComments((prev) => ({ ...prev, [approvalId]: value }));
  };

  const clearComment = (approvalId: string) => {
    setComments((prev) => {
      const next = { ...prev };
      delete next[approvalId];
      return next;
    });
  };

  const handleReview = async (id: string, action: "approve" | "reject") => {
    if (!token) return;
    const comment = comments[id];
    setLoading(true);
    setError("");
    try {
      await reviewApproval(token, id, action, comment);
      setStatus(action === "approve" ? "Godkände" : "Avslog");
      clearComment(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera");
    } finally {
      setLoading(false);
    }
  };

  return {
    approvals,
    history,
    status,
    error,
    loading,
    comments,
    quickComments,

    load,
    setQuickComment,
    setComment,
    handleReview,
  };
};
