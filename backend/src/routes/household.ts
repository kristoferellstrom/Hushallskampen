import { Router } from "express";
import { Household } from "../models/Household";
import { User } from "../models/User";
import { Chore } from "../models/Chore";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const defaultChores = [
  { title: "Diska", defaultPoints: 2, slug: "diska" },
  { title: "Dammsuga", defaultPoints: 2, slug: "dammsuga" },
  { title: "Tvätta", defaultPoints: 2, slug: "tvatta" },
  { title: "Toalett", defaultPoints: 3, slug: "toalett" },
  { title: "Fixare", defaultPoints: 3, slug: "fixare" },
  { title: "Handla", defaultPoints: 2, slug: "handla" },
  { title: "Husdjur", defaultPoints: 2, slug: "husdjur" },
  { title: "Kock", defaultPoints: 3, slug: "kock" },
  { title: "Sopor", defaultPoints: 1, slug: "sopor" },
];

async function genInvite() {
  let code = "";
  let exists = true;
  while (exists) {
    code = Math.random().toString(36).slice(2, 8).toUpperCase();
    exists = Boolean(await Household.findOne({ inviteCode: code }));
  }
  return code;
}

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, mode } = req.body;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    if (!name) return res.status(400).json({ error: "Missing name" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.householdId) return res.status(409).json({ error: "User already belongs to a household" });

    const inviteCode = await genInvite();
    const household = await Household.create({
      name,
      inviteCode,
      mode: mode || "competition",
      weeklyPrizeText: "",
      monthlyPrizeText: "",
      yearlyPrizeText: "",
    });

    user.householdId = household._id;
    await user.save();

    const chores = defaultChores.map((c) => ({ ...c, householdId: household._id, isDefault: true, isActive: true }));
    await Chore.insertMany(chores);

    res.json({ household });
  } catch (err) {
    res.status(500).json({ error: "Could not create household" });
  }
});

router.post("/join", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { inviteCode } = req.body;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    if (!inviteCode) return res.status(400).json({ error: "Missing inviteCode" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.householdId) return res.status(409).json({ error: "User already belongs to a household" });

    const household = await Household.findOne({ inviteCode: String(inviteCode).toUpperCase() });
    if (!household) return res.status(404).json({ error: "Household not found" });

    user.householdId = household._id;
    await user.save();
    res.json({ household });
  } catch (err) {
    res.status(500).json({ error: "Could not join household" });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ household: null });
    const household = await Household.findById(user.householdId);
    res.json({ household });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch household" });
  }
});

router.patch("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.status(400).json({ error: "No household" });

    const { mode, weeklyPrizeText, monthlyPrizeText, yearlyPrizeText, name, rulesText, approvalTimeoutHours, targetShares } = req.body;

    const household = await Household.findById(user.householdId);
    if (!household) return res.status(404).json({ error: "Household not found" });

    if (mode !== undefined) {
      if (!["competition", "equality"].includes(mode)) return res.status(400).json({ error: "Invalid mode" });
      household.mode = mode;
    }
    if (weeklyPrizeText !== undefined) household.weeklyPrizeText = weeklyPrizeText;
    if (monthlyPrizeText !== undefined) household.monthlyPrizeText = monthlyPrizeText;
    if (yearlyPrizeText !== undefined) household.yearlyPrizeText = yearlyPrizeText;
    if (name !== undefined) household.name = name;
    if (rulesText !== undefined) household.rulesText = rulesText;
    if (approvalTimeoutHours !== undefined) {
      const num = Number(approvalTimeoutHours);
      if (isNaN(num) || num < 0 || num > 168) return res.status(400).json({ error: "Invalid approval timeout" });
      household.approvalTimeoutHours = num;
    }
    if (Array.isArray(targetShares)) {
      const members = await User.find({ householdId: user.householdId }).select("_id");
      const memberIds = new Set(members.map((m) => String(m._id)));
      const cleaned: Array<{ userId: string; targetPct: number }> = [];
      for (const entry of targetShares) {
        const userId = String(entry.userId);
        const pct = Number(entry.targetPct);
        if (!memberIds.has(userId)) return res.status(400).json({ error: "Invalid member in targetShares" });
        if (isNaN(pct) || pct < 0 || pct > 100) return res.status(400).json({ error: "Invalid targetPct" });
        cleaned.push({ userId, targetPct: pct });
      }
      household.targetShares = cleaned;
    }

    await household.save();
    res.json({ household });
  } catch (err) {
    res.status(500).json({ error: "Could not update household" });
  }
});

router.get("/members", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ members: [] });

    const members = await User.find({ householdId: user.householdId }).select("name email createdAt color");
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: "Could not list members" });
  }
});

export default router;
