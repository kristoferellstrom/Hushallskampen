import { Schema, model, Document } from "mongoose";

export interface IChore extends Document {
  householdId: string;
  title: string;
  description?: string;
  defaultPoints: number;
  isActive: boolean;
  createdAt: Date;
}

const ChoreSchema = new Schema<IChore>({
  householdId: { type: Schema.Types.ObjectId as any, ref: "Household", required: true },
  title: { type: String, required: true },
  description: { type: String },
  defaultPoints: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() },
});

export const Chore = model<IChore>("Chore", ChoreSchema);
