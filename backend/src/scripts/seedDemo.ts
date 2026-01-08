import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "../db";
import { User } from "../models/User";
import { Household } from "../models/Household";
import { Chore } from "../models/Chore";
import { signToken } from "../utils/jwt";

dotenv.config();

const households = [
  {
    name: "Demo Household One",
    inviteCode: "DEMO01",
    mode: "competition",
    users: [
      { name: "Anna Demo", email: "anna.demo@example.com" },
      { name: "Bjorn Demo", email: "bjorn.demo@example.com" },
    ],
    chores: [
      { title: "Dishes", defaultPoints: 1 },
      { title: "Laundry", defaultPoints: 2 },
      { title: "Vacuum", defaultPoints: 2 },
    ],
  },
  {
    name: "Demo Household Two",
    inviteCode: "DEMO02",
    mode: "equality",
    users: [{ name: "Clara Demo", email: "clara.demo@example.com" }],
    chores: [
      { title: "Groceries", defaultPoints: 3 },
      { title: "Trash", defaultPoints: 1 },
    ],
  },
];

const passwordPlain = "testpass";

async function run() {
  await connectDB();
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  for (const hh of households) {
    let household = await Household.findOne({ inviteCode: hh.inviteCode });
    if (!household) {
      household = new Household({ name: hh.name, inviteCode: hh.inviteCode, mode: hh.mode });
      await household.save();
    }

    for (const u of hh.users) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = new User({ name: u.name, email: u.email, passwordHash, householdId: household._id });
        await user.save();
      } else if (!user.householdId) {
        user.householdId = household._id;
        await user.save();
      }
      console.log(`User ${u.email} token:`, signToken({ id: user._id }));
    }

    for (const c of hh.chores) {
      const exists = await Chore.findOne({ householdId: household._id, title: c.title });
      if (!exists) {
        await Chore.create({ householdId: household._id, title: c.title, defaultPoints: c.defaultPoints });
      }
    }
  }

  console.log("Seed demo done. Password for all demo users:", passwordPlain);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
