import { connectDB } from "../db";
import mongoose from "../db";
import { CalendarEntry } from "../models/CalendarEntry";
import { Chore } from "../models/Chore";
import { StatsRecord } from "../models/StatsRecord";

type TotalsMap = Map<string, number>;

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

const keyFor = (householdId: string, type: "week" | "month", start: Date, end: Date) =>
  `${householdId}:${type}:${start.toISOString()}:${end.toISOString()}`;

async function rebuild() {
  await connectDB();

  const entries = await CalendarEntry.find({ status: "approved" })
    .select("householdId choreId assignedToUserId approvedAt date")
    .lean();

  if (!entries.length) {
    console.log("No approved entries found. Nothing to rebuild.");
    await mongoose.disconnect();
    return;
  }

  const choreIds = Array.from(new Set(entries.map((e) => String(e.choreId))));
  const chores = await Chore.find({ _id: { $in: choreIds } }).select("_id defaultPoints").lean();
  const chorePoints = new Map(chores.map((c) => [String(c._id), c.defaultPoints ?? 0]));

  const records = new Map<
    string,
    {
      householdId: string;
      periodType: "week" | "month";
      periodStart: Date;
      periodEnd: Date;
      totalsByUser: TotalsMap;
    }
  >();

  for (const entry of entries) {
    const householdId = String(entry.householdId);
    const userId = String(entry.assignedToUserId);
    const points = chorePoints.get(String(entry.choreId)) ?? 0;
    const statsDate = (entry.date || entry.approvedAt) as Date | undefined;
    if (!statsDate) continue;

    (["week", "month"] as const).forEach((type) => {
      const { start, end } = periodKey(statsDate, type);
      const key = keyFor(householdId, type, start, end);
      if (!records.has(key)) {
        records.set(key, {
          householdId,
          periodType: type,
          periodStart: start,
          periodEnd: end,
          totalsByUser: new Map(),
        });
      }
      const rec = records.get(key)!;
      rec.totalsByUser.set(userId, (rec.totalsByUser.get(userId) || 0) + points);
    });
  }

  await StatsRecord.deleteMany({});

  const docs = Array.from(records.values()).map((rec) => ({
    householdId: rec.householdId,
    periodType: rec.periodType,
    periodStart: rec.periodStart,
    periodEnd: rec.periodEnd,
    totalsByUser: Array.from(rec.totalsByUser.entries()).map(([userId, points]) => ({ userId, points })),
  }));

  await StatsRecord.insertMany(docs);

  console.log(`Rebuilt ${docs.length} stats records from ${entries.length} approved entries.`);
  await mongoose.disconnect();
}

rebuild().catch(async (err) => {
  console.error("Failed to rebuild stats", err);
  await mongoose.disconnect();
  process.exit(1);
});
