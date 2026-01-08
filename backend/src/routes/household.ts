import { Router } from "express";
import { Household } from "../models/Household";
import { User } from "../models/User";
import { Chore } from "../models/Chore";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const defaultChores = [
  { title: "Dishes", defaultPoints: 1 },
  { title: "Vacuum", defaultPoints: 2 },
  { title: "Clean toilet", defaultPoints: 3 },
  { title: "Laundry", defaultPoints: 2 },
];

function genInvite() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, mode } = req.body;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    if (!name) return res.status(400).json({ error: "Missing name" });

    const inviteCode = genInvite();
    const household = new Household({ name, inviteCode, mode: mode || "competition" });
    await household.save();

    await User.findByIdAndUpdate(req.userId, { householdId: household._id });

    const chores = defaultChores.map((c) => ({ ...c, householdId: household._id }));
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

    const household = await Household.findOne({ inviteCode });
    if (!household) return res.status(404).json({ error: "Household not found" });

    await User.findByIdAndUpdate(req.userId, { householdId: household._id });
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

    const { mode, weeklyPrizeText, name } = req.body;
    const updates: any = {};
    if (mode !== undefined) {
      if (!["competition", "equality"].includes(mode)) return res.status(400).json({ error: "Invalid mode" });
      updates.mode = mode;
    }
    if (weeklyPrizeText !== undefined) updates.weeklyPrizeText = weeklyPrizeText;
    if (name !== undefined) updates.name = name;

    const household = await Household.findByIdAndUpdate(user.householdId, updates, { new: true });
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

    const members = await User.find({ householdId: user.householdId }).select("name email createdAt");
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: "Could not list members" });
  }
});

export default router;
