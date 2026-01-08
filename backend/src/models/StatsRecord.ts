import { Schema, model, Document } from "mongoose";

export interface IStatsRecord extends Document {
  householdId: string;
  periodType: "week" | "month";
  periodStart: Date;
  periodEnd: Date;
  totalsByUser: { userId: string; points: number }[];
}

const StatsRecordSchema = new Schema<IStatsRecord>({
  householdId: { type: Schema.Types.ObjectId as any, ref: "Household", required: true },
  periodType: { type: String, enum: ["week", "month"], required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  totalsByUser: [
    {
      userId: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
      points: { type: Number, default: 0 },
    },
  ],
});

export const StatsRecord = model<IStatsRecord>("StatsRecord", StatsRecordSchema);
