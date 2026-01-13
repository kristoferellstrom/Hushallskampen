import { useEffect, useMemo, useState } from "react";
import { getHousehold, listMembers, updateHousehold, updateColor } from "../api";
import { useAuth } from "../context/AuthContext";


type Member = { _id: string; name: string; color?: string };
type Mode = "competition" | "equality";

export const useSettingsPage = () => {
  const { token, user } = useAuth();

  const [invite, setInvite] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [colorStatus, setColorStatus] = useState("");
  const [colorError, setColorError] = useState("");
  const [mode, setMode] = useState<Mode>("competition");
  const [prize, setPrize] = useState("");
  const [updatingHousehold, setUpdatingHousehold] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [rulesText, setRulesText] = useState("");
  const [approvalTimeout, setApprovalTimeout] = useState<number | undefined>(undefined);
  const [targetShares, setTargetShares] = useState<Record<string, number>>({});

  const availableColors = useMemo(() => ["blue", "green", "red", "orange", "purple", "pink", "yellow", "teal"], []);
  const colorLabels: Record<string, string> = useMemo(
    () => ({
      blue: "Blå",
      green: "Grön",
      red: "Röd",
      orange: "Orange",
      purple: "Lila",
      pink: "Rosa",
      yellow: "Gul",
      teal: "Turkos",
    }),
    []
  );

  const loadInvite = async () => {
    setStatus("");
    setError("");
    try {
      if (!token) throw new Error("Ingen token");
      const res = await getHousehold(token);

      if (!res.household) {
        setStatus("Du har inget hushåll");
        setInvite("");
        setName("");
        setMode("competition");
        setPrize("");
        setRulesText("");
        setApprovalTimeout(undefined);
        setTargetShares({});
        return;
      }

      setInvite(res.household.inviteCode);
      setName(res.household.name);
      setMode(res.household.mode === "equality" ? "equality" : "competition");
      setPrize(res.household.weeklyPrizeText || "");
      setRulesText(res.household.rulesText || "");
      setApprovalTimeout(res.household.approvalTimeoutHours);

      if (res.household.targetShares) {
        const map: Record<string, number> = {};
        res.household.targetShares.forEach((t: any) => {
          map[t.userId] = t.targetPct;
        });
        setTargetShares(map);
      } else {
        setTargetShares({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta hushåll");
    }
  };

  const loadMembers = async () => {
    if (!token) return;
    setColorStatus("");
    setColorError("");
    try {
      const res = await listMembers(token);
      setMembers(res.members);
    } catch (err) {
      setColorError(err instanceof Error ? err.message : "Kunde inte hämta medlemmar");
    }
  };

  const handleColor = async (color: string) => {
    if (!token) return;
    setColorStatus("");
    setColorError("");
    try {
      await updateColor(token, color);
      setColorStatus("Färg uppdaterad");
      await loadMembers();
    } catch (err) {
      setColorError(err instanceof Error ? err.message : "Kunde inte uppdatera färg");
    }
  };

  const usedColors = useMemo(() => members.filter((m) => m.color).map((m) => m.color), [members]);
  const userColor = useMemo(() => members.find((m) => m._id === user?.id)?.color || user?.color, [members, user]);

  const handleUpdateHousehold = async () => {
    if (!token) return;
    setStatus("");
    setError("");
    setUpdatingHousehold(true);
    try {
      await updateHousehold(token, { name, mode, weeklyPrizeText: prize });
      setStatus("Hushållet uppdaterat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera hushåll");
    } finally {
      setUpdatingHousehold(false);
    }
  };

  const copyInvite = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite);
      setStatus("Koden kopierad");
    } catch {
      setStatus("Kunde inte kopiera koden");
    }
  };

  const setTargetShareForMember = (memberId: string, value: string) => {
    setTargetShares((prev) => {
      const next = { ...prev };
      if (value === "") {
        delete next[memberId];
        return next;
      }
      next[memberId] = Number(value);
      return next;
    });
  };

  useEffect(() => {
    loadInvite();
    loadMembers();
  }, [token]);

  return {
    token,
    user,

    invite,
    name,
    status,
    error,
    colorStatus,
    colorError,
    mode,
    prize,
    updatingHousehold,
    members,
    rulesText,
    approvalTimeout,
    targetShares,

    availableColors,
    colorLabels,
    usedColors,
    userColor,

    setName,
    setMode,
    setPrize,
    setRulesText,
    setApprovalTimeout,

    loadInvite,
    handleUpdateHousehold,
    copyInvite,
    handleColor,
    setTargetShareForMember,
  };
};
