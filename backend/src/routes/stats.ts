import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { StatsRecord } from "../models/StatsRecord";

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

export default router;
