import { Router } from "express";
import { db } from "@workspace/db";
import { integrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /integrations
router.get("/integrations", async (req, res) => {
  try {
    const rows = await db.select().from(integrationsTable);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list integrations");
    res.status(500).json({ error: "Failed to list integrations" });
  }
});

// GET /integrations/:id
router.get("/integrations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(integrationsTable).where(eq(integrationsTable.id, id));
    if (!row) return res.status(404).json({ error: "Integration not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get integration");
    res.status(500).json({ error: "Failed to get integration" });
  }
});

// PATCH /integrations/:id
router.patch("/integrations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db
      .update(integrationsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(integrationsTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Integration not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to update integration");
    res.status(500).json({ error: "Failed to update integration" });
  }
});

// POST /integrations/:id/connect
router.post("/integrations/:id/connect", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [integration] = await db.select().from(integrationsTable).where(eq(integrationsTable.id, id));
    if (!integration) return res.status(404).json({ error: "Integration not found" });

    // Return a simulated OAuth connect URL — in production wire up real OAuth flows
    const state = Buffer.from(JSON.stringify({ integrationId: id, ts: Date.now() })).toString("base64");
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=DEMO&redirect_uri=https://aria.app/oauth/callback&state=${state}&scope=${integration.scopes ?? ""}`;

    const [updated] = await db
      .update(integrationsTable)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(integrationsTable.id, id))
      .returning();

    res.json({ authUrl, state, integration: updated });
  } catch (err) {
    req.log.error({ err }, "Failed to initiate OAuth");
    res.status(500).json({ error: "Failed to initiate OAuth" });
  }
});

// POST /integrations/:id/disconnect
router.post("/integrations/:id/disconnect", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(integrationsTable)
      .set({ status: "disconnected", enabled: false, connectedAt: null, updatedAt: new Date() })
      .where(eq(integrationsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Integration not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to disconnect integration");
    res.status(500).json({ error: "Failed to disconnect integration" });
  }
});

export default router;
