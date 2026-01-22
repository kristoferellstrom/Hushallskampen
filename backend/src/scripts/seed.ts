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
    { householdId: household._id, title: "Diska", defaultPoints: 2, slug: "diska", isDefault: true, isActive: true },
    { householdId: household._id, title: "Dammsuga", defaultPoints: 2, slug: "dammsuga", isDefault: true, isActive: true },
    { householdId: household._id, title: "Tvätta", defaultPoints: 2, slug: "tvatta", isDefault: true, isActive: true },
    { householdId: household._id, title: "Toalett", defaultPoints: 3, slug: "toalett", isDefault: true, isActive: true },
    { householdId: household._id, title: "Fixare", defaultPoints: 3, slug: "fixare", isDefault: true, isActive: true },
    { householdId: household._id, title: "Handla", defaultPoints: 2, slug: "handla", isDefault: true, isActive: true },
    { householdId: household._id, title: "Husdjur", defaultPoints: 2, slug: "husdjur", isDefault: true, isActive: true },
    { householdId: household._id, title: "Kock", defaultPoints: 3, slug: "kock", isDefault: true, isActive: true },
    { householdId: household._id, title: "Sopor", defaultPoints: 1, slug: "sopor", isDefault: true, isActive: true },
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
