import { Router } from "express";
import { db } from "@workspace/db";
import { agentTable, actionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

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
    const allowed = ["name", "persona", "status", "avatarUrl", "timezone", "language", "systemPrompt"];
    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (key in req.body) update[key] = req.body[key];
    }
    const [updated] = await db
      .update(agentTable)
      .set(update)
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

    const [{ completed, inProgress, failed }] = await db
      .select({
        completed: sql<number>`coalesce(sum(case when ${tasksTable.status} = 'completed' then 1 else 0 end), 0)::int`,
        inProgress: sql<number>`coalesce(sum(case when ${tasksTable.status} = 'in_progress' then 1 else 0 end), 0)::int`,
        failed: sql<number>`coalesce(sum(case when ${tasksTable.status} = 'failed' then 1 else 0 end), 0)::int`,
      })
      .from(tasksTable);

    const [msgCount] = await db.select({ total: sql<number>`coalesce(sum(${conversationsTable.messageCount}), 0)::int` }).from(conversationsTable);
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
      tasksCompleted: Number(completed ?? 0),
      tasksInProgress: Number(inProgress ?? 0),
      tasksFailed: Number(failed ?? 0),
      messagesExchanged: Number(msgCount?.total ?? 0),
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
