import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { CalendarEntry } from "../models/CalendarEntry";
import { Chore } from "../models/Chore";

const router = Router();

const defaultChores = [
  { title: "Diska", slug: "diska" },
  { title: "Dammsuga", slug: "dammsuga" },
  { title: "Tvätta", slug: "tvatta" },
  { title: "Toalett", slug: "toalett" },
  { title: "Fixare", slug: "fixare" },
  { title: "Handla", slug: "handla" },
  { title: "Husdjur", slug: "husdjur" },
  { title: "Kock", slug: "kock" },
  { title: "Sopor", slug: "sopor" },
];

const badgeImages: Record<string, string> = {
  diska: "/badge/manadens_diskare.png",
  dammsuga: "/badge/manadens_dammsugare.png",
  tvatta: "/badge/manadens_tvattmastare.png",
  toalett: "/badge/manadesn_toalett.png",
  fixare: "/badge/manadens_fixare.png",
  handla: "/badge/manadens_handlare.png",
  husdjur: "/badge/manadens_husdjurshjälte.png",
  kock: "/badge/manadens_koksmastare.png",
  sopor: "/badge/manadens_sopgeneral.png",
};

function monthKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function isCurrentMonth(key: string) {
  const now = new Date();
  const currentKey = monthKey(now);
  return key === currentKey;
}

function lastCompletedYear(): number {
  const now = new Date();
  return now.getFullYear() - 1;
}

router.get("/monthly-badges", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ badges: [] });

    const entries = await CalendarEntry.find({ householdId: user.householdId, status: "approved" })
      .populate({ path: "choreId", select: "slug isDefault title defaultPoints" })
      .populate({ path: "assignedToUserId", select: "name" });

    type CountMap = Map<string, Map<string, Map<string, number>>>;
    const perSlugMonth: CountMap = new Map();
    const userNames = new Map<string, string>();
    const allowedSlugs = new Set(defaultChores.map((c) => c.slug));
    const currentMonthKey = monthKey(new Date());
    const monthCounts = new Map<string, Map<string, number>>();
    const monthPointsByMonth = new Map<string, Map<string, number>>();
    const yearPoints = new Map<string, number>();
    const targetYear = lastCompletedYear();
    let latestCompletedMonthKey: string | null = null;

    for (const entry of entries) {
      const chore: any = entry.choreId;
      if (!chore?.isDefault || !chore.slug || !allowedSlugs.has(chore.slug)) continue;
      const assigned: any = entry.assignedToUserId;
      const userId = String(assigned?._id);
      if (!userId) continue;

      userNames.set(userId, assigned?.name || "");

      const key = monthKey(new Date(entry.date));
      if (isCurrentMonth(key)) continue; // räkna bara avslutade månader
      if (!latestCompletedMonthKey || key > latestCompletedMonthKey) latestCompletedMonthKey = key;
      const byMonth = perSlugMonth.get(chore.slug) || new Map<string, Map<string, number>>();
      const byUser = byMonth.get(key) || new Map<string, number>();
      byUser.set(userId, (byUser.get(userId) || 0) + 1);
      byMonth.set(key, byUser);
      perSlugMonth.set(chore.slug, byMonth);

      const mCounts = monthCounts.get(chore.slug) || new Map<string, number>();
      mCounts.set(userId, (mCounts.get(userId) || 0) + 1);
      monthCounts.set(chore.slug, mCounts);
      const pts = Number(chore.defaultPoints ?? 0);
      const mp = monthPointsByMonth.get(key) || new Map<string, number>();
      mp.set(userId, (mp.get(userId) || 0) + pts);
      monthPointsByMonth.set(key, mp);

      const entryYear = new Date(entry.date).getFullYear();
      if (entryYear === targetYear) {
        const ptsYear = Number(chore.defaultPoints ?? 0);
        yearPoints.set(userId, (yearPoints.get(userId) || 0) + ptsYear);
      }
    }

    const badges = defaultChores.map((base) => {
      const byMonth = perSlugMonth.get(base.slug) || new Map<string, Map<string, number>>();
      const winCounts = new Map<string, number>();
      const monthWinners: Array<{ userId: string; name: string; count: number }> = [];

      for (const [, counts] of byMonth.entries()) {
        const totalCount = Array.from(counts.values()).reduce((sum, n) => sum + n, 0);
        if (totalCount < 5) continue; // kräver minst 5 händelser i månaden för sysslan

        let top = 0;
        for (const [, n] of counts.entries()) {
          if (n > top) top = n;
        }
        if (top === 0) continue;
        for (const [uid, n] of counts.entries()) {
          if (n === top) {
            winCounts.set(uid, (winCounts.get(uid) || 0) + 1);
          }
        }
      }

      const monthCount = monthCounts.get(base.slug);
      if (monthCount) {
        let top = 0;
        for (const [, n] of monthCount.entries()) {
          if (n > top) top = n;
        }
        const totalCount = Array.from(monthCount.values()).reduce((sum, n) => sum + n, 0);
        if (top > 0 && totalCount >= 5) {
          for (const [uid, n] of monthCount.entries()) {
            if (n === top) {
              monthWinners.push({ userId: uid, name: userNames.get(uid) || "", count: n });
            }
          }
        }
      }

      const winners = Array.from(winCounts.entries())
        .map(([userId, wins]) => ({ userId, name: userNames.get(userId) || "", wins }))
        .sort((a, b) => b.wins - a.wins);

      return {
        slug: base.slug,
        title: base.title,
        image: badgeImages[base.slug],
        winners,
        monthWinners,
      };
    });

    const monthPointsWinner = (() => {
      if (!latestCompletedMonthKey) return null;
      const mp = monthPointsByMonth.get(latestCompletedMonthKey);
      if (!mp) return null;
      let topId: string | null = null;
      let topPoints = 0;
      for (const [uid, pts] of mp.entries()) {
        if (pts > topPoints) {
          topPoints = pts;
          topId = uid;
        }
      }
      return topId ? { userId: topId, name: userNames.get(topId) || "", points: topPoints } : null;
    })();

    const yearPointsWinner = (() => {
      if (yearPoints.size === 0) return null;
      let topId: string | null = null;
      let topPoints = 0;
      for (const [uid, pts] of yearPoints.entries()) {
        if (pts > topPoints) {
          topPoints = pts;
          topId = uid;
        }
      }
      return topId ? { userId: topId, name: userNames.get(topId) || "", points: topPoints } : null;
    })();

    res.json({ badges, monthPointsWinner, yearPointsWinner });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch monthly badges" });
  }
});

export default router;
