import { useEffect, useMemo, useState } from "react";
import { listApprovalHistory, listApprovals, reviewApproval } from "../api";
import { useAuth } from "../context/AuthContext";
import { emitDataUpdated } from "../utils/appEvents";

export type Approval = {
  _id: string;
  submittedByUserId: { _id: string; name: string; email: string; color?: string | null };
  reviewedByUserId?: { _id: string; name: string; email: string; color?: string | null };
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
    { chore: string; user: string; userId: string; count: number }[]
  >([]);
  const [yearChoreLeaders, setYearChoreLeaders] = useState<
    { chore: string; user: string; userId: string; count: number }[]
  >([]);
  const [yearChoreTotals, setYearChoreTotals] = useState<{ chore: string; count: number }[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});

  const quickComments = useMemo(() => ["Bra jobbat 💪", "Ok men slarvigt", "Behöver göras om"], []);

  const load = async () => {
    if (!token) return;
    setStatus("Laddar...");
    setError("");
    try {
      const res = await listApprovals(token);
      const filtered = res.approvals.filter((a: any) => a.submittedByUserId?._id !== user?.id);
      setApprovals(filtered);
      setStatus(filtered.length > 0 ? `Att granska: ${filtered.length}` : "Inga att granska just nu");
      const hist = await listApprovalHistory(token, Math.max(historyLimit, 200));
      setHistory(hist.approvals);

      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      const recent = hist.approvals.filter((h: any) => {
        const d = new Date(h.createdAt || h.calendarEntryId?.date || "");
        return !isNaN(d.getTime()) && d >= monthAgo;
      });
      setLastMonthHistory(recent);

      const choreMap: Record<
        string,
        { counts: Record<string, number>; names: Record<string, string>; ids: Record<string, string> }
      > = {};
      recent.forEach((h: any) => {
        const title = h.calendarEntryId?.choreId?.title || "Syssla";
        const uid = h.submittedByUserId?._id || "";
        const uname = h.submittedByUserId?.name || "-";
        if (!choreMap[title]) choreMap[title] = { counts: {}, names: {}, ids: {} };
        choreMap[title].counts[uid] = (choreMap[title].counts[uid] || 0) + 1;
        choreMap[title].names[uid] = uname;
        choreMap[title].ids[uid] = uid;
      });
      const leaders = Object.entries(choreMap).map(([chore, data]) => {
        const entries = Object.entries(data.counts).sort((a, b) => b[1] - a[1]);
        const [uid, count] = entries[0] || ["", 0];
        return { chore, user: data.names[uid] || "-", userId: data.ids[uid] || uid, count };
      });
      setMonthlyChoreLeaders(leaders);

      const yearRecent = hist.approvals.filter((h: any) => {
        const d = new Date(h.createdAt || h.calendarEntryId?.date || "");
        return !isNaN(d.getTime()) && d >= yearStart;
      });
      const yearMap: Record<
        string,
        { counts: Record<string, number>; names: Record<string, string>; ids: Record<string, string> }
      > = {};
      yearRecent.forEach((h: any) => {
        const title = h.calendarEntryId?.choreId?.title || "Syssla";
        const uid = h.submittedByUserId?._id || "";
        const uname = h.submittedByUserId?.name || "-";
        if (!yearMap[title]) yearMap[title] = { counts: {}, names: {}, ids: {} };
        yearMap[title].counts[uid] = (yearMap[title].counts[uid] || 0) + 1;
        yearMap[title].names[uid] = uname;
        yearMap[title].ids[uid] = uid;
      });
      const yearLeaders = Object.entries(yearMap).map(([chore, data]) => {
        const entries = Object.entries(data.counts).sort((a, b) => b[1] - a[1]);
        const [uid, count] = entries[0] || ["", 0];
        return { chore, user: data.names[uid] || "-", userId: data.ids[uid] || uid, count };
      });
      setYearChoreLeaders(yearLeaders);

      const yearTotals = Object.entries(yearMap)
        .map(([chore, data]) => {
          const totalCount = Object.values(data.counts).reduce((sum, val) => sum + val, 0);
          return { chore, count: totalCount };
        })
        .sort((a, b) => b.count - a.count);
      setYearChoreTotals(yearTotals);
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
      emitDataUpdated();
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
    yearChoreLeaders,
    yearChoreTotals,
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
