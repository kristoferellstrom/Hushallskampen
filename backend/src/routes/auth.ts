import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, passwordHash });
  await user.save();

  const token = signToken({ id: user._id });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: user._id });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
  const user = await User.findById(req.userId).select("name email householdId createdAt");
  res.json({ user });
});

export default router;
