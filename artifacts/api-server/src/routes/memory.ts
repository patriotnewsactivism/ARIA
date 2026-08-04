import { Router } from "express";
import { db } from "@workspace/db";
import { memoryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const ALLOWED_MEMORY_FIELDS = ["key", "value", "category", "pinned"];

// GET /memory
router.get("/memory", async (req, res) => {
  try {
    const { category } = req.query;
    const rows = category
      ? await db.select().from(memoryTable).where(eq(memoryTable.category, category as string)).orderBy(desc(memoryTable.pinned), desc(memoryTable.createdAt))
      : await db.select().from(memoryTable).orderBy(desc(memoryTable.pinned), desc(memoryTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list memory");
    res.status(500).json({ error: "Failed to list memory" });
  }
});

// POST /memory
router.post("/memory", async (req, res) => {
  try {
    const { key, value, category, pinned } = req.body;
    if (!key || typeof key !== "string" || !value || typeof value !== "string") {
      return res.status(400).json({ error: "Key and value are required" });
    }
    const [entry] = await db.insert(memoryTable).values({ key, value, category: category ?? "general", pinned: pinned ?? false }).returning();
    res.status(201).json(entry);
  } catch (err) {
    req.log.error({ err }, "Failed to create memory entry");
    res.status(500).json({ error: "Failed to create memory entry" });
  }
});

// PATCH /memory/:id
router.patch("/memory/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid memory id" });
    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of ALLOWED_MEMORY_FIELDS) {
      if (key in req.body) update[key] = req.body[key];
    }
    const [entry] = await db.update(memoryTable).set(update).where(eq(memoryTable.id, id)).returning();
    if (!entry) return res.status(404).json({ error: "Memory entry not found" });
    res.json(entry);
  } catch (err) {
    req.log.error({ err }, "Failed to update memory entry");
    res.status(500).json({ error: "Failed to update memory entry" });
  }
});

// DELETE /memory/:id
router.delete("/memory/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid memory id" });
    await db.delete(memoryTable).where(eq(memoryTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete memory entry");
    res.status(500).json({ error: "Failed to delete memory entry" });
  }
});

export default router;
