import { Router } from "express";
import { db } from "@workspace/db";
import { actionsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

// GET /actions
router.get("/actions", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string ?? "50") || 50;
    const rows = await db.select().from(actionsTable).orderBy(desc(actionsTable.createdAt)).limit(limit);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list actions");
    res.status(500).json({ error: "Failed to list actions" });
  }
});

// GET /actions/feed
router.get("/actions/feed", async (req, res) => {
  try {
    const rows = await db.select().from(actionsTable).orderBy(desc(actionsTable.createdAt)).limit(100);

    // Group by day
    const byDay: Record<string, typeof rows> = {};
    for (const action of rows) {
      const day = action.createdAt.toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(action);
    }

    const feed = Object.entries(byDay)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, actions]) => ({ date, actions }));

    res.json(feed);
  } catch (err) {
    req.log.error({ err }, "Failed to get activity feed");
    res.status(500).json({ error: "Failed to get activity feed" });
  }
});

export default router;
