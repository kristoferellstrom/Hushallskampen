import { Schema, model, Document } from "mongoose";

export interface IHousehold extends Document {
  name: string;
  inviteCode: string;
  mode: "competition" | "equality";
  weeklyPrizeText?: string;
  rulesText?: string;
  approvalTimeoutHours?: number;
  targetShares?: Array<{ userId: string; targetPct: number }>;
  createdAt: Date;
}

const HouseholdSchema = new Schema<IHousehold>({
  name: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  mode: { type: String, required: true, default: "competition" },
  weeklyPrizeText: { type: String },
  rulesText: { type: String },
  approvalTimeoutHours: { type: Number },
  targetShares: [
    {
      userId: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
      targetPct: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: () => new Date() },
});

export const Household = model<IHousehold>("Household", HouseholdSchema);
