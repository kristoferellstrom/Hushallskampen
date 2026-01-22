import { Schema, model, Document } from "mongoose";

export interface IChore extends Document {
  householdId: string;
  title: string;
  description?: string;
  defaultPoints: number;
  isActive: boolean;
  isDefault: boolean;
  slug?: string;
  createdAt: Date;
}

const ChoreSchema = new Schema<IChore>({
  householdId: { type: Schema.Types.ObjectId as any, ref: "Household", required: true },
  title: { type: String, required: true },
  description: { type: String },
  defaultPoints: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  slug: { type: String },
  createdAt: { type: Date, default: () => new Date() },
});

ChoreSchema.index({ householdId: 1, slug: 1 }, { unique: true, sparse: true });

export const Chore = model<IChore>("Chore", ChoreSchema);
