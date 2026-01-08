import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  householdId?: string;
  color?: string;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  householdId: { type: Schema.Types.ObjectId as any, ref: "Household" },
  color: { type: String },
  createdAt: { type: Date, default: () => new Date() },
});

UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = model<IUser>("User", UserSchema);
