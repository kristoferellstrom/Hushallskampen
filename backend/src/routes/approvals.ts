import { Router } from "express";
import { Approval } from "../models/Approval";
import { CalendarEntry } from "../models/CalendarEntry";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { Chore } from "../models/Chore";
import { StatsRecord } from "../models/StatsRecord";

const router = Router();
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ approvals: [] });

    const approvals = await Approval.find({ status: "pending" })
      .populate({
        path: "calendarEntryId",
        match: { householdId: user.householdId },
        populate: [
          { path: "choreId", select: "title defaultPoints" },
          { path: "assignedToUserId", select: "name email householdId" },
        ],
      })
      .populate({ path: "submittedByUserId", select: "name email householdId" });

    const filtered = approvals.filter(
      (a: any) =>
        a.calendarEntryId &&
        String(a.submittedByUserId) !== String(req.userId) &&
        a.calendarEntryId.assignedToUserId &&
        String(a.calendarEntryId.assignedToUserId.householdId || a.calendarEntryId.householdId) === String(user.householdId),
    );

    res.json({ approvals: filtered });
  } catch (err) {
    res.status(500).json({ error: "Could not list approvals" });
  }
});

router.post("/:id/review", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const { action, comment } = req.body;
    if (!action || (action !== "approve" && action !== "reject")) return res.status(400).json({ error: "Invalid action" });

    const reviewer = await User.findById(req.userId).select("householdId");
    if (!reviewer || !reviewer.householdId) return res.status(400).json({ error: "No household" });

    const approval = await Approval.findById(id);
    if (!approval) return res.status(404).json({ error: "Approval not found" });
    if (String(approval.submittedByUserId) === String(req.userId)) return res.status(403).json({ error: "Cannot review your own submission" });
    if (approval.status !== "pending") return res.status(400).json({ error: "Approval already reviewed" });

    const entry: any = await CalendarEntry.findById(approval.calendarEntryId as any);
    if (!entry) return res.status(404).json({ error: "Calendar entry not found" });
    if (String(entry.householdId) !== String(reviewer.householdId)) return res.status(403).json({ error: "Not in the same household" });
    if (entry.status !== "submitted") return res.status(400).json({ error: "Entry not submitted" });

    if (action === "approve") {
      approval.status = "approved";
      approval.reviewedByUserId = req.userId;
      approval.comment = comment;
      await approval.save();

      entry.status = "approved";
      entry.approvedAt = new Date();
      await entry.save();

      const chore = await Chore.findById(entry.choreId).select("defaultPoints");
      const points = chore?.defaultPoints ?? 0;
      const approvedAt = entry.approvedAt || new Date();

      const periodKey = (date: Date, type: "week" | "month") => {
        const d = new Date(date);
        if (type === "month") {
          return { start: new Date(d.getFullYear(), d.getMonth(), 1), end: new Date(d.getFullYear(), d.getMonth() + 1, 1) };
        }
        const day = d.getDay();
        const diffToMonday = (day + 6) % 7;
        const monday = new Date(d);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(d.getDate() - diffToMonday);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);
        return { start: monday, end: nextMonday };
      };

      const upsertStats = async (type: "week" | "month") => {
        const { start, end } = periodKey(approvedAt, type);
        let record = await StatsRecord.findOne({ householdId: reviewer.householdId, periodType: type, periodStart: start, periodEnd: end });
        if (!record) {
          record = await StatsRecord.create({
            householdId: reviewer.householdId,
            periodType: type,
            periodStart: start,
            periodEnd: end,
            totalsByUser: [],
          });
        }
        const existing = record.totalsByUser.find((t: any) => String(t.userId) === String(entry.assignedToUserId));
        if (existing) {
          existing.points += points;
        } else {
          record.totalsByUser.push({ userId: entry.assignedToUserId, points });
        }
        await record.save();
      };

      await Promise.all([upsertStats("week"), upsertStats("month")]);
    } else {
      approval.status = "rejected";
      approval.reviewedByUserId = req.userId;
      approval.comment = comment;
      await approval.save();

      entry.status = "planned";
      await entry.save();
    }

    res.json({ approval, entry });
  } catch (err) {
    res.status(500).json({ error: "Could not review approval" });
  }
});

export default router;
