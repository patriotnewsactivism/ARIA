import { Router } from "express";
import { db } from "@workspace/db";
import { workflowsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

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
    const id = parseInt(req.params.id);
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
    const id = parseInt(req.params.id);
    const [wf] = await db.update(workflowsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(workflowsTable.id, id)).returning();
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
    const id = parseInt(req.params.id);
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
    const id = parseInt(req.params.id);
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
