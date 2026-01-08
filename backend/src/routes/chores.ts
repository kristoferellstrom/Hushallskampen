import { Router } from "express";
import { Chore } from "../models/Chore";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ chores: [] });
    const chores = await Chore.find({ householdId: user.householdId, isActive: true });
    res.json({ chores });
  } catch (err) {
    res.status(500).json({ error: "Could not list chores" });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { title, description, defaultPoints } = req.body;
    if (!title) return res.status(400).json({ error: "Missing title" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.status(400).json({ error: "No household" });

    const chore = new Chore({
      householdId: user.householdId,
      title,
      description,
      defaultPoints: defaultPoints ?? 1,
    });
    await chore.save();
    res.json({ chore });
  } catch (err) {
    res.status(500).json({ error: "Could not create chore" });
  }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const { title, description, defaultPoints, isActive } = req.body;
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.status(400).json({ error: "No household" });

    const chore = await Chore.findById(id);
    if (!chore || String(chore.householdId) !== String(user.householdId)) return res.status(404).json({ error: "Chore not found" });

    if (title !== undefined) chore.title = title;
    if (description !== undefined) chore.description = description;
    if (defaultPoints !== undefined) chore.defaultPoints = defaultPoints;
    if (isActive !== undefined) chore.isActive = isActive;

    await chore.save();
    res.json({ chore });
  } catch (err) {
    res.status(500).json({ error: "Could not update chore" });
  }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.status(400).json({ error: "No household" });

    const chore = await Chore.findById(id);
    if (!chore || String(chore.householdId) !== String(user.householdId)) return res.status(404).json({ error: "Chore not found" });

    await chore.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete chore" });
  }
});

export default router;
