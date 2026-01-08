import { Router } from "express";
import { CalendarEntry } from "../models/CalendarEntry";
import { Chore } from "../models/Chore";
import { User } from "../models/User";
import { Approval } from "../models/Approval";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Create a calendar entry (plan a chore)
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { choreId, date, assignedToUserId } = req.body;
    if (!choreId || !date || !assignedToUserId) return res.status(400).json({ error: "Missing fields" });

    const chore = await Chore.findById(choreId);
    if (!chore) return res.status(404).json({ error: "Chore not found" });

    // ensure assigned user is in same household
    const assignedUser = await User.findById(assignedToUserId);
    if (!assignedUser || String(assignedUser.householdId) !== String(chore.householdId)) return res.status(400).json({ error: "Invalid assigned user" });

    const entry = await CalendarEntry.create({
      householdId: chore.householdId,
      choreId: chore._id,
      assignedToUserId,
      date: new Date(date),
      status: "planned",
    });
    res.json({ entry });
  } catch (err) {
    res.status(500).json({ error: "Could not create calendar entry" });
  }
});

// Submit a calendar entry as done -> creates Approval
router.post("/:id/submit", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const entry = await CalendarEntry.findById(id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    if (String(entry.assignedToUserId) !== String(req.userId)) return res.status(403).json({ error: "Not assigned to you" });

    // check user has no other pending approvals
    const pending = await Approval.findOne({ submittedByUserId: req.userId, status: "pending" });
    if (pending) return res.status(400).json({ error: "You already have a pending approval" });

    entry.status = "submitted";
    entry.submittedAt = new Date();
    await entry.save();

    const approval = await Approval.create({ calendarEntryId: entry._id, submittedByUserId: req.userId });
    res.json({ entry, approval });
  } catch (err) {
    res.status(500).json({ error: "Could not submit entry" });
  }
});

export default router;
