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
  const { token, user } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [history, setHistory] = useState<Approval[]>([]);
  const [lastMonthHistory, setLastMonthHistory] = useState<Approval[]>([]);
  const [monthlyChoreLeaders, setMonthlyChoreLeaders] = useState<
    { chore: string; user: string; count: number }[]
  >([]);
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
      const filtered = res.approvals.filter((a: any) => a.submittedByUserId?._id !== user?.id);
      setApprovals(filtered);
      setStatus(`Att granska: ${filtered.length}`);
      const hist = await listApprovalHistory(token, Math.max(historyLimit, 200));
      setHistory(hist.approvals);

      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const recent = hist.approvals.filter((h: any) => {
        const d = new Date(h.createdAt || h.calendarEntryId?.date || "");
        return !isNaN(d.getTime()) && d >= monthAgo;
      });
      setLastMonthHistory(recent);

      const choreMap: Record<string, { counts: Record<string, number>; names: Record<string, string> }> = {};
      recent.forEach((h: any) => {
        const title = h.calendarEntryId?.choreId?.title || "Syssla";
        const uid = h.submittedByUserId?._id || "";
        const uname = h.submittedByUserId?.name || "-";
        if (!choreMap[title]) choreMap[title] = { counts: {}, names: {} };
        choreMap[title].counts[uid] = (choreMap[title].counts[uid] || 0) + 1;
        choreMap[title].names[uid] = uname;
      });
      const leaders = Object.entries(choreMap).map(([chore, data]) => {
        const entries = Object.entries(data.counts).sort((a, b) => b[1] - a[1]);
        const [uid, count] = entries[0] || ["", 0];
        return { chore, user: data.names[uid] || "-", count };
      });
      setMonthlyChoreLeaders(leaders);
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
    lastMonthHistory,
    monthlyChoreLeaders,
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
