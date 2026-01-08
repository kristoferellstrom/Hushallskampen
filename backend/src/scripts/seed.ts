import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../db";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Household } from "../models/Household";
import { Chore } from "../models/Chore";
import { signToken } from "../utils/jwt";

dotenv.config();

const run = async () => {
  await connectDB();

  const testEmail = "test@example.com";
  const existing = await User.findOne({ email: testEmail });
  if (existing) {
    console.log("Test user already exists:", existing.email);
    console.log("Token:", signToken({ id: existing._id }));
    return;
  }

  const passwordHash = await bcrypt.hash("testpass", 10);
  const user = new User({ name: "Test User", email: testEmail, passwordHash });
  await user.save();

  const household = new Household({ name: "Test Household", inviteCode: "TEST01" });
  await household.save();

  user.householdId = household._id;
  await user.save();

  const chores = [
    { householdId: household._id, title: "Dishes", defaultPoints: 1 },
    { householdId: household._id, title: "Vacuum", defaultPoints: 2 },
    { householdId: household._id, title: "Laundry", defaultPoints: 2 },
  ];
  await Chore.insertMany(chores);

  console.log("Seed complete");
  console.log("Test user:", testEmail, "password: testpass");
  console.log("Token:", signToken({ id: user._id }));
};

run()
  .then(() => mongoose.connection.close())
  .catch(async (err) => {
    console.error(err);
    await mongoose.connection.close();
    process.exit(1);
  });
