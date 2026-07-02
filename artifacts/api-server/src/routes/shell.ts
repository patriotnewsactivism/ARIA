import { Router } from "express";
import { db } from "@workspace/db";
import { shellSessionsTable, shellCommandsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
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
    const id = parseInt(req.params.id);
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
    const id = parseInt(req.params.id);
    await db.update(shellSessionsTable).set({ status: "closed", updatedAt: new Date() }).where(eq(shellSessionsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to close shell session");
    res.status(500).json({ error: "Failed to close shell session" });
  }
});

// POST /shell/sessions/:id/execute
router.post("/shell/sessions/:id/execute", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { command } = req.body;

    const [session] = await db.select().from(shellSessionsTable).where(eq(shellSessionsTable.id, id));
    if (!session) return res.status(404).json({ error: "Session not found" });

    const startTime = Date.now();
    let output = "";
    let exitCode = 0;

    // Safety: block destructive patterns and secret-exfiltration attempts
    const blocked = /^\s*(rm\s+-rf|mkfs|dd\s+if=|:(){ :|:&};:|curl.*\$\(|wget.*\$\(|base64\s+-d|eval\s+\$)/i;
    // Also block any attempt to read secret env vars
    const secretLeak = /\$\s*(OPENAI_API_KEY|DATABASE_URL|SESSION_SECRET|AWS_|STRIPE_|GITHUB_TOKEN)/i;
    if (blocked.test(command) || secretLeak.test(command)) {
      output = "Command blocked by ARIA safety policy.";
      exitCode = 1;
    } else {
      try {
        const result = await execAsync(command, {
          cwd: session.workingDir,
          timeout: 15000,
          // Strip secrets from child process environment
          env: {
            PATH: process.env.PATH,
            HOME: "/home",
            USER: "aria",
            TERM: "xterm-256color",
            LANG: "en_US.UTF-8",
          },
        });
        output = (result.stdout + result.stderr).trim() || "(no output)";
      } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string; code?: number };
        output = ((err.stdout ?? "") + (err.stderr ?? "")).trim() || String(e);
        exitCode = err.code ?? 1;
      }
    }

    const duration = Date.now() - startTime;

    const [cmd] = await db
      .insert(shellCommandsTable)
      .values({ sessionId: id, command, output, exitCode, executedAt: new Date() })
      .returning();

    await db
      .update(shellSessionsTable)
      .set({ commandCount: session.commandCount + 1, updatedAt: new Date() })
      .where(eq(shellSessionsTable.id, id));

    res.json({ id: cmd.id, command, output, exitCode, duration });
  } catch (err) {
    req.log.error({ err }, "Failed to execute command");
    res.status(500).json({ error: "Failed to execute command" });
  }
});

export default router;
