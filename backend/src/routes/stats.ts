import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { StatsRecord } from "../models/StatsRecord";
import { Household } from "../models/Household";

const router = Router();

router.get("/weekly", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ totals: [] });

    const totals = await StatsRecord.find({ householdId: user.householdId, periodType: "week" })
      .sort({ periodStart: -1 })
      .limit(8)
      .populate({ path: "totalsByUser.userId", select: "name email" });

    res.json({ totals });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch weekly stats" });
  }
});

router.get("/monthly", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ totals: [] });

    const totals = await StatsRecord.find({ householdId: user.householdId, periodType: "month" })
      .sort({ periodStart: -1 })
      .limit(6)
      .populate({ path: "totalsByUser.userId", select: "name email" });

    res.json({ totals });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch monthly stats" });
  }
});

router.get("/leaderboard", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ leaderboard: null });

    const record = await StatsRecord.findOne({ householdId: user.householdId, periodType: "week" })
      .sort({ periodStart: -1 })
      .populate({ path: "totalsByUser.userId", select: "name email" });
    if (!record) return res.json({ leaderboard: null });

    const sorted = [...record.totalsByUser].sort((a: any, b: any) => b.points - a.points);
    const totalPoints = sorted.reduce((sum: number, t: any) => sum + t.points, 0);
    const winner = sorted[0] ? { userId: sorted[0].userId, points: sorted[0].points } : null;

    res.json({
      leaderboard: {
        periodStart: record.periodStart,
        periodEnd: record.periodEnd,
        totals: sorted,
        totalPoints,
        winner,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch leaderboard" });
  }
});

router.get("/equality", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ equality: null });

    const household = await Household.findById(user.householdId).select("mode");
    const record = await StatsRecord.findOne({ householdId: user.householdId, periodType: "week" })
      .sort({ periodStart: -1 })
      .populate({ path: "totalsByUser.userId", select: "name email" });

    if (!record) return res.json({ equality: null });

    const totalPoints = record.totalsByUser.reduce((sum: number, t: any) => sum + t.points, 0);
    const shares = record.totalsByUser.map((t: any) => ({
      userId: t.userId,
      points: t.points,
      share: totalPoints > 0 ? Math.round((t.points / totalPoints) * 100) : 0,
    }));

    res.json({
      equality: {
        mode: household?.mode,
        periodStart: record.periodStart,
        periodEnd: record.periodEnd,
        totalPoints,
        shares,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch equality stats" });
  }
});

export default router;
