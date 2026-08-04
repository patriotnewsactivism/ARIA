import { Router } from "express";
import { db } from "@workspace/db";
import { shellSessionsTable, shellCommandsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// GET /shell/sessions
router.get("/shell/sessions", async (req, res) => {
  try {
    const rows = await db.select().from(shellSessionsTable).orderBy(desc(shellSessionsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list shell sessions");
    res.status(500).json({ error: "Failed to list shell sessions" });
  }
});

// POST /shell/sessions
router.post("/shell/sessions", async (req, res) => {
  try {
    const { name, workingDir } = req.body;
    const [session] = await db
      .insert(shellSessionsTable)
      .values({ name: name ?? "Session", workingDir: workingDir ?? "/home" })
      .returning();
    res.status(201).json(session);
  } catch (err) {
    req.log.error({ err }, "Failed to create shell session");
    res.status(500).json({ error: "Failed to create shell session" });
  }
});

// GET /shell/sessions/:id
router.get("/shell/sessions/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid session id" });
    const [session] = await db.select().from(shellSessionsTable).where(eq(shellSessionsTable.id, id));
    if (!session) return res.status(404).json({ error: "Session not found" });
    const commands = await db
      .select()
      .from(shellCommandsTable)
      .where(eq(shellCommandsTable.sessionId, id))
      .orderBy(shellCommandsTable.executedAt);
    res.json({ ...session, commands });
  } catch (err) {
    req.log.error({ err }, "Failed to get shell session");
    res.status(500).json({ error: "Failed to get shell session" });
  }
});

// DELETE /shell/sessions/:id
router.delete("/shell/sessions/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid session id" });
    await db.update(shellSessionsTable).set({ status: "closed", updatedAt: new Date() }).where(eq(shellSessionsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to close shell session");
    res.status(500).json({ error: "Failed to close shell session" });
  }
});

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// POST /shell/sessions/:id/execute
// DISABLED: shell execution is disabled until it can be sandboxed and
// protected by authentication. The previous implementation used regex-only
// blocking that was trivially bypassable (see ARIA_DIAGNOSIS.md).
router.post("/shell/sessions/:id/execute", async (req, res) => {
  try {
    return res.status(503).json({ error: "Shell execution is temporarily disabled" });
  } catch (err) {
    req.log.error({ err }, "Failed to execute command");
    res.status(500).json({ error: "Failed to execute command" });
  }
});

export default router;
