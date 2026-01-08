import { Schema, model, Document } from "mongoose";

export type CalendarStatus = "planned" | "submitted" | "approved" | "rejected";

export interface ICalendarEntry extends Document {
  householdId: string;
  choreId: string;
  assignedToUserId: string;
  date: Date;
  status: CalendarStatus;
  submittedAt?: Date;
  approvedAt?: Date;
}

const CalendarEntrySchema = new Schema<ICalendarEntry>({
  householdId: { type: Schema.Types.ObjectId as any, ref: "Household", required: true },
  choreId: { type: Schema.Types.ObjectId as any, ref: "Chore", required: true },
  assignedToUserId: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["planned", "submitted", "approved", "rejected"], default: "planned" },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
});

export const CalendarEntry = model<ICalendarEntry>("CalendarEntry", CalendarEntrySchema);
