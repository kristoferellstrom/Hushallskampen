import { useEffect, useMemo, useState } from "react";
import { getHousehold, listMembers, updateHousehold, updateColor } from "../api";
import { useAuth } from "../context/AuthContext";


type Member = { _id: string; name: string; color?: string };
type Mode = "competition" | "equality";

export const useSettingsPage = () => {
  const { token, user, refreshUser } = useAuth();

  const [invite, setInvite] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [colorStatus, setColorStatus] = useState("");
  const [colorError, setColorError] = useState("");
  const [mode, setMode] = useState<Mode>("competition");
  const [prize, setPrize] = useState("");
  const [monthPrize, setMonthPrize] = useState("");
  const [yearPrize, setYearPrize] = useState("");
  const [updatingHousehold, setUpdatingHousehold] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [rulesText, setRulesText] = useState("");
  const [targetShares, setTargetShares] = useState<Record<string, number>>({});
  const [baseline, setBaseline] = useState({
    mode: "competition" as Mode,
    prize: "",
    monthPrize: "",
    yearPrize: "",
    rulesText: "",
    targetShares: {} as Record<string, number>,
  });

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
        setMonthPrize("");
        setYearPrize("");
        setRulesText("");
        setTargetShares({});
        return;
      }

      setInvite(res.household.inviteCode);
      setName(res.household.name);
      setMode(res.household.mode === "equality" ? "equality" : "competition");
      localStorage.setItem("householdMode", res.household.mode === "equality" ? "equality" : "competition");
      setPrize(res.household.weeklyPrizeText || "");
      setMonthPrize((res.household as any).monthlyPrizeText || "");
      setYearPrize((res.household as any).yearlyPrizeText || "");
      setRulesText(res.household.rulesText || "");
      setBaseline({
        mode: res.household.mode === "equality" ? "equality" : "competition",
        prize: res.household.weeklyPrizeText || "",
        monthPrize: (res.household as any).monthlyPrizeText || "",
        yearPrize: (res.household as any).yearlyPrizeText || "",
        rulesText: res.household.rulesText || "",
        targetShares:
          res.household.targetShares?.reduce((map: Record<string, number>, t: any) => {
            map[String(t.userId)] = t.targetPct;
            return map;
          }, {}) || {},
      });

      if (res.household.targetShares && res.household.targetShares.length > 0) {
        const map: Record<string, number> = {};
        res.household.targetShares.forEach((t: any) => {
          map[String(t.userId)] = t.targetPct;
        });
        setTargetShares(map);
      } else {
        // behåll tidigare om inget skickas tillbaka
        setTargetShares((prev) => ({ ...prev }));
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
      localStorage.setItem("hk_user_color", color);
      await refreshUser();
      setColorStatus("Färg uppdaterad");
      await loadMembers();
    } catch (err) {
      setColorError(err instanceof Error ? err.message : "Kunde inte uppdatera färg");
    }
  };

  const usedColors = useMemo(() => members.filter((m) => m.color).map((m) => m.color), [members]);
  const userColor = useMemo(() => members.find((m) => m._id === user?.id)?.color || user?.color, [members, user]);

  const isTargetSharesDirty = useMemo(() => {
    const keys = new Set([...Object.keys(targetShares), ...Object.keys(baseline.targetShares)]);
    for (const k of keys) {
      if ((targetShares[k] ?? "") !== (baseline.targetShares[k] ?? "")) return true;
    }
    return false;
  }, [targetShares, baseline.targetShares]);

  const householdDirty =
    mode !== baseline.mode ||
    prize !== baseline.prize ||
    monthPrize !== baseline.monthPrize ||
    yearPrize !== baseline.yearPrize ||
    rulesText !== baseline.rulesText ||
    isTargetSharesDirty;

  const handleUpdateHousehold = async () => {
    if (!token) return;
    setStatus("");
    setError("");
    setUpdatingHousehold(true);
    try {
     


      const targetShareArray = Object.entries(targetShares).map(([userId, targetPct]) => ({
        userId,
        targetPct: Number(targetPct),
      }));

      await updateHousehold(token, {
        name,
        mode,
        weeklyPrizeText: prize,
        monthlyPrizeText: monthPrize,
        yearlyPrizeText: yearPrize,
        rulesText,
        targetShares: targetShareArray.length ? targetShareArray : undefined,
      });
      localStorage.setItem("householdMode", mode);
      setBaseline({
        mode,
        prize,
        monthPrize,
        yearPrize,
        rulesText,
        targetShares: targetShareArray.reduce((acc, t) => {
          acc[t.userId] = t.targetPct;
          return acc;
        }, {} as Record<string, number>),
      });
      await loadInvite(); 
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
    monthPrize,
    yearPrize,
    updatingHousehold,
    members,
    rulesText,
    targetShares,

    availableColors,
    colorLabels,
    usedColors,
    userColor,

    setName,
    setMode,
    setPrize,
    setMonthPrize,
    setYearPrize,
    setRulesText,

    loadInvite,
    handleUpdateHousehold,
    copyInvite,
    handleColor,
    setTargetShareForMember,
    householdDirty,
  };
};
