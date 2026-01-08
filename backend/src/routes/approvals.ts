import { Router } from "express";
import { Approval } from "../models/Approval";
import { CalendarEntry } from "../models/CalendarEntry";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ approvals: [] });

    const approvals = await Approval.find({ status: "pending" })
      .populate({
        path: "calendarEntryId",
        populate: [
          { path: "choreId", select: "title defaultPoints" },
          { path: "assignedToUserId", select: "name email householdId" },
        ],
      })
      .populate({ path: "submittedByUserId", select: "name email householdId" });

    const filtered = approvals.filter((a: any) => {
      const entry: any = a.calendarEntryId;
      return (
        entry &&
        String(entry.householdId) === String(user.householdId) &&
        String(a.submittedByUserId) !== String(req.userId) &&
        entry.assignedToUserId &&
        String(entry.assignedToUserId.householdId || entry.householdId) === String(user.householdId)
      );
    });

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

    if (action === "approve") {
      approval.status = "approved";
      approval.reviewedByUserId = req.userId;
      approval.comment = comment;
      await approval.save();

      entry.status = "approved";
      entry.approvedAt = new Date();
      await entry.save();
    } else {
      approval.status = "rejected";
      approval.reviewedByUserId = req.userId;
      approval.comment = comment;
      await approval.save();

      entry.status = "rejected";
      await entry.save();
    }

    res.json({ approval, entry });
  } catch (err) {
    res.status(500).json({ error: "Could not review approval" });
  }
});

export default router;
