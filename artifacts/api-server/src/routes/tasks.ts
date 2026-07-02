import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

// GET /tasks
router.get("/tasks", async (req, res) => {
  try {
    const { status } = req.query;
    const query = db.select().from(tasksTable).orderBy(desc(tasksTable.createdAt));
    const rows = await (status
      ? db.select().from(tasksTable).where(eq(tasksTable.status, status as string)).orderBy(desc(tasksTable.createdAt))
      : query);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list tasks");
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

// POST /tasks
router.post("/tasks", async (req, res) => {
  try {
    const { title, description, priority, dueAt, tags } = req.body;
    const [task] = await db
      .insert(tasksTable)
      .values({ title, description, priority: priority ?? "medium", dueAt: dueAt ? new Date(dueAt) : undefined, tags })
      .returning();
    res.status(201).json(task);
  } catch (err) {
    req.log.error({ err }, "Failed to create task");
    res.status(500).json({ error: "Failed to create task" });
  }
});

// GET /tasks/summary — must be before /:id
router.get("/tasks/summary", async (req, res) => {
  try {
    const rows = await db
      .select({ status: tasksTable.status, cnt: sql<number>`count(*)::int` })
      .from(tasksTable)
      .groupBy(tasksTable.status);

    const summary = { pending: 0, in_progress: 0, completed: 0, failed: 0, cancelled: 0, total: 0 };
    for (const r of rows) {
      const key = r.status as keyof typeof summary;
      if (key in summary) summary[key] = r.cnt;
      summary.total += r.cnt;
    }
    res.json(summary);
  } catch (err) {
    req.log.error({ err }, "Failed to get task summary");
    res.status(500).json({ error: "Failed to get task summary" });
  }
});

// GET /tasks/:id
router.get("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    req.log.error({ err }, "Failed to get task");
    res.status(500).json({ error: "Failed to get task" });
  }
});

// PATCH /tasks/:id
router.patch("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const update: Record<string, unknown> = { ...req.body, updatedAt: new Date() };
    if (req.body.status === "completed" && !req.body.completedAt) {
      update.completedAt = new Date();
    }
    if (req.body.dueAt) update.dueAt = new Date(req.body.dueAt as string);
    const [task] = await db.update(tasksTable).set(update).where(eq(tasksTable.id, id)).returning();
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    req.log.error({ err }, "Failed to update task");
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /tasks/:id
router.delete("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tasksTable).where(eq(tasksTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete task");
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
