import { Router } from "express";
import { CalendarEntry } from "../models/CalendarEntry";
import { Chore } from "../models/Chore";
import { User } from "../models/User";
import { Approval } from "../models/Approval";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

function getRange(query: any) {
  const parse = (val: any) => {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const start = query.startDate ? parse(query.startDate) : null;
  const end = query.endDate ? parse(query.endDate) : null;

  if (start && end) return { start, end };

  // default: current week (Mon-Sun)
  const now = new Date();
  const day = now.getDay(); // 0 Sun - 6 Sat
  const diffToMonday = (day + 6) % 7; // days since Monday
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  return { start: start || monday, end: end || sunday };
}

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ entries: [] });

    const { start, end } = getRange(req.query);
    if (!start || !end) return res.status(400).json({ error: "Invalid date range" });

    const entries = await CalendarEntry.find({
      householdId: user.householdId,
      date: { $gte: start, $lt: end },
    })
      .populate({ path: "choreId", select: "title defaultPoints" })
      .populate({ path: "assignedToUserId", select: "name email" })
      .sort({ date: 1 });

    res.json({ entries, range: { start, end } });
  } catch (err) {
    res.status(500).json({ error: "Could not list calendar entries" });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { choreId, date, assignedToUserId } = req.body;
    if (!choreId || !date || !assignedToUserId) return res.status(400).json({ error: "Missing fields" });

    const chore = await Chore.findById(choreId);
    if (!chore) return res.status(404).json({ error: "Chore not found" });

    const assignedUser = await User.findById(assignedToUserId);
    if (!assignedUser || String(assignedUser.householdId) !== String(chore.householdId)) return res.status(400).json({ error: "Invalid assigned user" });

    const existing = await CalendarEntry.findOne({
      householdId: chore.householdId,
      choreId: chore._id,
      assignedToUserId,
      date: new Date(date),
      status: "planned",
    });
    if (existing) return res.status(409).json({ error: "Duplicate planned entry" });

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

router.post("/:id/submit", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const entry = await CalendarEntry.findById(id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    if (String(entry.assignedToUserId) !== String(req.userId)) return res.status(403).json({ error: "Not assigned to you" });
    if (entry.status !== "planned") return res.status(400).json({ error: "Entry not in planned state" });

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

router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const { date, assignedToUserId } = req.body;

    const entry = await CalendarEntry.findById(id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.status(400).json({ error: "No household" });
    if (String(entry.householdId) !== String(user.householdId)) return res.status(403).json({ error: "Not allowed" });

    if (entry.status !== "planned") return res.status(400).json({ error: "Only planned entries can be edited" });

    if (assignedToUserId) {
      const assignedUser = await User.findById(assignedToUserId);
      if (!assignedUser || String(assignedUser.householdId) !== String(user.householdId)) return res.status(400).json({ error: "Invalid assigned user" });
      entry.assignedToUserId = assignedToUserId;
    }
    if (date) {
      const newDate = new Date(date);
      if (isNaN(newDate.getTime())) return res.status(400).json({ error: "Invalid date" });
      entry.date = newDate;
    }
    await entry.save();
    res.json({ entry });
  } catch (err) {
    res.status(500).json({ error: "Could not update entry" });
  }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const entry = await CalendarEntry.findById(id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.status(400).json({ error: "No household" });
    if (String(entry.householdId) !== String(user.householdId)) return res.status(403).json({ error: "Not allowed" });
    if (entry.status !== "planned" && entry.status !== "rejected") return res.status(400).json({ error: "Only planned/rejected can be deleted" });

    await entry.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete entry" });
  }
});

export default router;
