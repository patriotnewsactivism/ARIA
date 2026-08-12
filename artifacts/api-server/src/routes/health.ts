import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error("HEALTHZ_DB_ERROR:", err);
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      debug_error: err instanceof Error ? err.message : String(err),
      debug_code: (err as any)?.code,
    });
  }
});

export default router;
