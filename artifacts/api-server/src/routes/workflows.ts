import { Router } from "express";
import { db } from "@workspace/db";
import { workflowsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const ALLOWED_WORKFLOW_FIELDS = ["name", "description", "trigger", "steps", "enabled"];

// GET /workflows
router.get("/workflows", async (req, res) => {
  try {
    const rows = await db.select().from(workflowsTable).orderBy(desc(workflowsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list workflows");
    res.status(500).json({ error: "Failed to list workflows" });
  }
});

// POST /workflows
router.post("/workflows", async (req, res) => {
  try {
    const { name, description, trigger, steps } = req.body;
    if (!name || typeof name !== "string" || !trigger || typeof trigger !== "string" || !steps || typeof steps !== "string") {
      return res.status(400).json({ error: "Name, trigger, and steps are required" });
    }
    const [wf] = await db.insert(workflowsTable).values({ name, description, trigger, steps }).returning();
    res.status(201).json(wf);
  } catch (err) {
    req.log.error({ err }, "Failed to create workflow");
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

// GET /workflows/:id
router.get("/workflows/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid workflow id" });
    const [wf] = await db.select().from(workflowsTable).where(eq(workflowsTable.id, id));
    if (!wf) return res.status(404).json({ error: "Workflow not found" });
    res.json(wf);
  } catch (err) {
    req.log.error({ err }, "Failed to get workflow");
    res.status(500).json({ error: "Failed to get workflow" });
  }
});

// PATCH /workflows/:id
router.patch("/workflows/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid workflow id" });
    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of ALLOWED_WORKFLOW_FIELDS) {
      if (key in req.body) update[key] = req.body[key];
    }
    const [wf] = await db.update(workflowsTable).set(update).where(eq(workflowsTable.id, id)).returning();
    if (!wf) return res.status(404).json({ error: "Workflow not found" });
    res.json(wf);
  } catch (err) {
    req.log.error({ err }, "Failed to update workflow");
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

// DELETE /workflows/:id
router.delete("/workflows/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid workflow id" });
    await db.delete(workflowsTable).where(eq(workflowsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete workflow");
    res.status(500).json({ error: "Failed to delete workflow" });
  }
});

// POST /workflows/:id/toggle
router.post("/workflows/:id/toggle", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid workflow id" });
    const [existing] = await db.select().from(workflowsTable).where(eq(workflowsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Workflow not found" });
    const [wf] = await db
      .update(workflowsTable)
      .set({ enabled: !existing.enabled, updatedAt: new Date() })
      .where(eq(workflowsTable.id, id))
      .returning();
    res.json(wf);
  } catch (err) {
    req.log.error({ err }, "Failed to toggle workflow");
    res.status(500).json({ error: "Failed to toggle workflow" });
  }
});

export default router;
