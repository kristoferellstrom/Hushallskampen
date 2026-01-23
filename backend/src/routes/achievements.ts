import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { computeAchievements } from "../services/achievements";

const router = Router();

router.get("/monthly-badges", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(req.userId).select("householdId");
    if (!user?.householdId) {
      return res.json({ badges: [], monthPointsWinner: null, yearPointsWinner: null });
    }

    const result = await computeAchievements(String(user.householdId));

    const firstMonthWinner = Array.isArray(result.monthPointsWinner) ? result.monthPointsWinner[0] ?? null : result.monthPointsWinner;
    const firstYearWinner = Array.isArray(result.yearPointsWinner) ? result.yearPointsWinner[0] ?? null : result.yearPointsWinner;

    return res.json({
      badges: result.badges,
      monthPointsWinner: firstMonthWinner,
      yearPointsWinner: firstYearWinner,
      latestCompletedMonthKey: result.latestCompletedMonthKey ?? null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch achievements" });
  }
});

export default router;
