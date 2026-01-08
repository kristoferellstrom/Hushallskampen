import { Schema, model, Document } from "mongoose";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface IApproval extends Document {
  calendarEntryId: string;
  submittedByUserId: string;
  reviewedByUserId?: string;
  status: ApprovalStatus;
  comment?: string;
  createdAt: Date;
}

const ApprovalSchema = new Schema<IApproval>({
  calendarEntryId: { type: Schema.Types.ObjectId as any, ref: "CalendarEntry", required: true, unique: true },
  submittedByUserId: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
  reviewedByUserId: { type: Schema.Types.ObjectId as any, ref: "User" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  comment: { type: String },
  createdAt: { type: Date, default: () => new Date() },
});

export const Approval = model<IApproval>("Approval", ApprovalSchema);
