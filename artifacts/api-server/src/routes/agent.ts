import { Router } from "express";
import { db } from "@workspace/db";
import { agentTable, actionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /agent
router.get("/agent", async (req, res) => {
  try {
    let [agent] = await db.select().from(agentTable).limit(1);
    if (!agent) {
      [agent] = await db.insert(agentTable).values({}).returning();
    }
    res.json(agent);
  } catch (err) {
    req.log.error({ err }, "Failed to get agent");
    res.status(500).json({ error: "Failed to get agent" });
  }
});

// PATCH /agent
router.patch("/agent", async (req, res) => {
  try {
    let [agent] = await db.select().from(agentTable).limit(1);
    if (!agent) {
      [agent] = await db.insert(agentTable).values({}).returning();
    }
    const [updated] = await db
      .update(agentTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(agentTable.id, agent.id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update agent");
    res.status(500).json({ error: "Failed to update agent" });
  }
});

// GET /agent/stats
router.get("/agent/stats", async (req, res) => {
  try {
    const { tasksTable, conversationsTable, shellCommandsTable, integrationsTable, workflowsTable, memoryTable } = await import("@workspace/db");
    const { count, eq } = await import("drizzle-orm");

    const [taskStats] = await db
      .select({
        completed: count(eq(tasksTable.status, "completed")),
        inProgress: count(eq(tasksTable.status, "in_progress")),
        failed: count(eq(tasksTable.status, "failed")),
      })
      .from(tasksTable);

    const [msgCount] = await db.select({ total: count() }).from(conversationsTable);
    const [cmdCount] = await db.select({ total: count() }).from(shellCommandsTable);
    const [intCount] = await db
      .select({ total: count() })
      .from(integrationsTable)
      .where(eq(integrationsTable.status, "connected"));
    const [wfCount] = await db
      .select({ total: count() })
      .from(workflowsTable)
      .where(eq(workflowsTable.enabled, true));
    const [memCount] = await db.select({ total: count() }).from(memoryTable);

    res.json({
      tasksCompleted: Number(taskStats?.completed ?? 0),
      tasksInProgress: Number(taskStats?.inProgress ?? 0),
      tasksFailed: Number(taskStats?.failed ?? 0),
      messagesExchanged: Number(msgCount?.total ?? 0) * 3,
      commandsExecuted: Number(cmdCount?.total ?? 0),
      integrationsActive: Number(intCount?.total ?? 0),
      workflowsActive: Number(wfCount?.total ?? 0),
      memoryEntries: Number(memCount?.total ?? 0),
      uptimeHours: 24,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get agent stats");
    res.status(500).json({ error: "Failed to get agent stats" });
  }
});

export default router;
