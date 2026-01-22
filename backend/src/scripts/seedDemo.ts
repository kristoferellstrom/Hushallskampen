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
      { title: "Diska", defaultPoints: 2, slug: "diska", isDefault: true, isActive: true },
      { title: "Dammsuga", defaultPoints: 2, slug: "dammsuga", isDefault: true, isActive: true },
      { title: "Tvätta", defaultPoints: 2, slug: "tvatta", isDefault: true, isActive: true },
      { title: "Toalett", defaultPoints: 3, slug: "toalett", isDefault: true, isActive: true },
      { title: "Fixare", defaultPoints: 3, slug: "fixare", isDefault: true, isActive: true },
      { title: "Handla", defaultPoints: 2, slug: "handla", isDefault: true, isActive: true },
      { title: "Husdjur", defaultPoints: 2, slug: "husdjur", isDefault: true, isActive: true },
      { title: "Kock", defaultPoints: 3, slug: "kock", isDefault: true, isActive: true },
      { title: "Sopor", defaultPoints: 1, slug: "sopor", isDefault: true, isActive: true },
    ],
  },
  {
    name: "Demo Household Two",
    inviteCode: "DEMO02",
    mode: "equality",
    users: [{ name: "Clara Demo", email: "clara.demo@example.com" }],
    chores: [
      { title: "Diska", defaultPoints: 2, slug: "diska", isDefault: true, isActive: true },
      { title: "Dammsuga", defaultPoints: 2, slug: "dammsuga", isDefault: true, isActive: true },
      { title: "Tvätta", defaultPoints: 2, slug: "tvatta", isDefault: true, isActive: true },
      { title: "Toalett", defaultPoints: 3, slug: "toalett", isDefault: true, isActive: true },
      { title: "Fixare", defaultPoints: 3, slug: "fixare", isDefault: true, isActive: true },
      { title: "Handla", defaultPoints: 2, slug: "handla", isDefault: true, isActive: true },
      { title: "Husdjur", defaultPoints: 2, slug: "husdjur", isDefault: true, isActive: true },
      { title: "Kock", defaultPoints: 3, slug: "kock", isDefault: true, isActive: true },
      { title: "Sopor", defaultPoints: 1, slug: "sopor", isDefault: true, isActive: true },
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
