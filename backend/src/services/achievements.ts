import { CalendarEntry } from "../models/CalendarEntry";
import { User } from "../models/User";

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
  kampe: "/badge/manadens_kampe.png",
  latmask: "/badge/manadens_latmask.png",
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

export async function computeAchievements(householdId: string) {
  const members = await User.find({ householdId }).select("name");
  const memberIds = members.map((m) => String(m._id));

  const entries = await CalendarEntry.find({ householdId, status: "approved" })
    .populate({ path: "choreId", select: "slug isDefault title defaultPoints" })
    .populate({ path: "assignedToUserId", select: "name" });

  type CountMap = Map<string, Map<string, Map<string, number>>>;
  const perSlugMonth: CountMap = new Map();
  const userNames = new Map<string, string>();
  for (const m of members) userNames.set(String(m._id), m.name || "");

  const allowedSlugs = new Set(defaultChores.map((c) => c.slug));
  const monthCounts = new Map<string, Map<string, number>>(); // endast default-sysslor (för badges)
  const monthPointsByMonthAll = new Map<string, Map<string, number>>(); // alla sysslor (för poängvinnare)
  const totalTasksPerMonthAll = new Map<string, Map<string, number>>(); // alla sysslor (för kämpe/latmask)
  const yearPointsAll = new Map<string, number>(); // alla sysslor (års-poäng)
  const targetYear = lastCompletedYear();
  let latestCompletedMonthKey: string | null = null;

  for (const entry of entries) {
    const chore: any = entry.choreId;
    const assigned: any = entry.assignedToUserId;
    const userId = String(assigned?._id);
    if (!userId) continue;

    userNames.set(userId, assigned?.name || "");

    const key = monthKey(new Date(entry.date));
    if (isCurrentMonth(key)) continue; // räkna bara avslutade månader
    if (!latestCompletedMonthKey || key > latestCompletedMonthKey) latestCompletedMonthKey = key;

    const pts = Number(chore?.defaultPoints ?? 0);
    const mpAll = monthPointsByMonthAll.get(key) || new Map<string, number>();
    mpAll.set(userId, (mpAll.get(userId) || 0) + pts);
    monthPointsByMonthAll.set(key, mpAll);

    const entryYear = new Date(entry.date).getFullYear();
    if (entryYear === targetYear) {
      yearPointsAll.set(userId, (yearPointsAll.get(userId) || 0) + pts);
    }

    const totalTasksMonthAll = totalTasksPerMonthAll.get(key) || new Map<string, number>();
    totalTasksMonthAll.set(userId, (totalTasksMonthAll.get(userId) || 0) + 1);
    totalTasksPerMonthAll.set(key, totalTasksMonthAll);

    if (!chore?.isDefault || !chore.slug || !allowedSlugs.has(chore.slug)) continue;

    const byMonth = perSlugMonth.get(chore.slug) || new Map<string, Map<string, number>>();
    const byUser = byMonth.get(key) || new Map<string, number>();
    byUser.set(userId, (byUser.get(userId) || 0) + 1);
    byMonth.set(key, byUser);
    perSlugMonth.set(chore.slug, byMonth);

    const mCounts = monthCounts.get(chore.slug) || new Map<string, number>();
    mCounts.set(userId, (mCounts.get(userId) || 0) + 1);
    monthCounts.set(chore.slug, mCounts);
  }
  for (const [month, counts] of totalTasksPerMonthAll.entries()) {
    for (const uid of memberIds) {
      if (!counts.has(uid)) counts.set(uid, 0);
    }
    totalTasksPerMonthAll.set(month, counts);
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
      for (const [, n] of monthCount.entries()) if (n > top) top = n;
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

  const extraBadges: Array<{ slug: string; title: string; image?: string; winners: { userId: string; name: string; wins: number }[] }> = [];

  const kampeWins = new Map<string, number>();
  const latmaskWins = new Map<string, number>();

  for (const [, counts] of totalTasksPerMonthAll.entries()) {
    const totalTasksAll = Array.from(counts.values()).reduce((sum, n) => sum + n, 0);
    if (totalTasksAll > 0) {
      let top = 0;
      for (const [, n] of counts.entries()) if (n > top) top = n;
      if (top > 0) {
        for (const [uid, n] of counts.entries()) {
          if (n === top) {
            kampeWins.set(uid, (kampeWins.get(uid) || 0) + 1);
          }
        }
      }
    }
    for (const [uid, n] of counts.entries()) {
      if (n === 0) latmaskWins.set(uid, (latmaskWins.get(uid) || 0) + 1);
    }
  }

  const pushExtra = (slug: string, title: string, winsMap: Map<string, number>) => {
    if (winsMap.size === 0) return;
    const winners = Array.from(winsMap.entries())
      .map(([userId, wins]) => ({ userId, name: userNames.get(userId) || "", wins }))
      .sort((a, b) => b.wins - a.wins);
    const image = badgeImages[slug];
    extraBadges.push(image ? { slug, title, image, winners } : { slug, title, winners });
  };

  pushExtra("kampe", "Månadens kämpe", kampeWins);
  pushExtra("latmask", "Månadens latmask", latmaskWins);

  const monthPointsWinner = (() => {
    if (!latestCompletedMonthKey) return null;
    const mp = monthPointsByMonthAll.get(latestCompletedMonthKey);
    if (!mp) return null;
    let top = 0;
    for (const [, pts] of mp.entries()) if (pts > top) top = pts;
    if (top === 0) return null;
    const winners = Array.from(mp.entries())
      .filter(([, pts]) => pts === top)
      .map(([uid, pts]) => ({ userId: uid, name: userNames.get(uid) || "", points: pts }));
    return winners;
  })();

  const yearPointsWinner = (() => {
    if (yearPointsAll.size === 0) return null;
    let top = 0;
    for (const [, pts] of yearPointsAll.entries()) if (pts > top) top = pts;
    if (top === 0) return null;
    const winners = Array.from(yearPointsAll.entries())
      .filter(([, pts]) => pts === top)
      .map(([uid, pts]) => ({ userId: uid, name: userNames.get(uid) || "", points: pts }));
    return winners;
  })();

  return { badges: [...badges, ...extraBadges], monthPointsWinner, yearPointsWinner, latestCompletedMonthKey };
}
