import { Router } from "express";
import { Chore } from "../models/Chore";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const defaultChores = [
  { title: "Diska", defaultPoints: 2, slug: "diska" },
  { title: "Dammsuga", defaultPoints: 2, slug: "dammsuga" },
  { title: "Tvätta", defaultPoints: 2, slug: "tvatta" },
  { title: "Toalett", defaultPoints: 3, slug: "toalett" },
  { title: "Fixare", defaultPoints: 3, slug: "fixare" },
  { title: "Handla", defaultPoints: 2, slug: "handla" },
  { title: "Husdjur", defaultPoints: 2, slug: "husdjur" },
  { title: "Kock", defaultPoints: 3, slug: "kock" },
  { title: "Sopor", defaultPoints: 1, slug: "sopor" },
];


const englishDefaults = new Set(["dishes", "vacuum", "cleantoilet", "laundry", "groceries", "trash"]);

const normalize = (s?: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export async function ensureDefaultChores(householdId: string) {
  const defaultsByTitle = new Map(defaultChores.map((c) => [c.title.toLowerCase(), c]));
  const defaultsBySlug = new Map(defaultChores.map((c) => [c.slug, c]));


  const current = await Chore.find({ householdId });
  for (const chore of current) {
    const normTitle = normalize(chore.title);
    const normSlug = normalize(chore.slug);

    if (englishDefaults.has(normTitle) || englishDefaults.has(normSlug)) {
      await chore.deleteOne();
      continue;
    }

    const bySlug = chore.slug ? defaultsBySlug.get(chore.slug) : undefined;
    const byTitle = defaultsByTitle.get(chore.title.toLowerCase());
    const base = bySlug || byTitle;
    if (base) {
      chore.title = base.title;
      chore.slug = base.slug;
      chore.defaultPoints = base.defaultPoints;
      chore.isDefault = true;
      chore.isActive = chore.isActive ?? true;
      await chore.save();
    }
  }
  for (const base of defaultChores) {
    const existing = await Chore.findOne({ householdId, slug: base.slug });
    if (existing) continue;
    await Chore.create({
      householdId,
      ...base,
      isDefault: true,
      isActive: true,
    });
  }
}

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.json({ chores: [] });

    await ensureDefaultChores(String(user.householdId));

    const chores = await Chore.find({ householdId: user.householdId });
    res.json({ chores });
  } catch (err) {
    res.status(500).json({ error: "Could not list chores" });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { title, description, defaultPoints } = req.body;
    if (!title) return res.status(400).json({ error: "Missing title" });
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.status(400).json({ error: "No household" });

    const slug = String(title).trim().toLowerCase().replace(/\s+/g, "-");
    const isReserved = defaultChores.some((c) => c.slug === slug);
    if (isReserved) return res.status(400).json({ error: "Den här sysslan är reserverad och finns redan" });

    const chore = new Chore({
      householdId: user.householdId,
      title,
      description,
      defaultPoints: defaultPoints ?? 1,
      slug,
    });
    await chore.save();
    res.json({ chore });
  } catch (err) {
    res.status(500).json({ error: "Could not create chore" });
  }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const { title, description, defaultPoints, isActive } = req.body;
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.status(400).json({ error: "No household" });

    const chore = await Chore.findById(id);
    if (!chore || String(chore.householdId) !== String(user.householdId)) return res.status(404).json({ error: "Chore not found" });

    if (chore.isDefault) {
      if (title !== undefined && title !== chore.title) {
        return res.status(400).json({ error: "Standard-sysslor kan inte döpas om" });
      }
      if (description !== undefined) chore.description = description;
      if (defaultPoints !== undefined) chore.defaultPoints = defaultPoints;
      if (isActive !== undefined) chore.isActive = isActive;
      await chore.save();
      return res.json({ chore });
    }

    if (title !== undefined) chore.title = title;
    if (description !== undefined) chore.description = description;
    if (defaultPoints !== undefined) chore.defaultPoints = defaultPoints;
    if (isActive !== undefined) chore.isActive = isActive;

    await chore.save();
    res.json({ chore });
  } catch (err) {
    res.status(500).json({ error: "Could not update chore" });
  }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const user = await User.findById(req.userId).select("householdId");
    if (!user || !user.householdId) return res.status(400).json({ error: "No household" });

    const chore = await Chore.findById(id);
    if (!chore || String(chore.householdId) !== String(user.householdId)) return res.status(404).json({ error: "Chore not found" });

    if (chore.isDefault) return res.status(400).json({ error: "Standard-sysslor kan inte tas bort" });

    await chore.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete chore" });
  }
});

export default router;
