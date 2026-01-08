import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

const router = Router();

const allowedColors = ["blue", "green", "red", "orange", "purple", "pink", "yellow", "teal"];

router.patch("/color", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { color } = req.body;
    if (!color || !allowedColors.includes(color)) return res.status(400).json({ error: "Invalid color" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.householdId) return res.status(400).json({ error: "User has no household" });

    const conflict = await User.findOne({ householdId: user.householdId, color, _id: { $ne: user._id } });
    if (conflict) return res.status(409).json({ error: "Color already taken in this household" });

    user.color = color;
    await user.save();
    res.json({ color: user.color });
  } catch (err) {
    res.status(500).json({ error: "Could not update color" });
  }
});

export default router;
