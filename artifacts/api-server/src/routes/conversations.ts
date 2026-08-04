import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router = Router();

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /conversations
router.get("/conversations", async (req, res) => {
  try {
    const rows = await db.select().from(conversationsTable).orderBy(desc(conversationsTable.updatedAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

// POST /conversations
router.post("/conversations", async (req, res) => {
  try {
    const { title } = req.body;
    const [conv] = await db.insert(conversationsTable).values({ title: title ?? "New conversation" }).returning();
    res.status(201).json(conv);
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// GET /conversations/:id
router.get("/conversations/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid conversation id" });
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id));
    res.json({ ...conv, messages });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

// DELETE /conversations/:id
router.delete("/conversations/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid conversation id" });
    await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// POST /conversations/:id/messages (plain save, no AI)
router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid conversation id" });
    const { content } = req.body;
    const [msg] = await db.insert(messagesTable).values({ conversationId: id, role: "user", content }).returning();
    const [{ total }] = await db.select({ total: count() }).from(messagesTable).where(eq(messagesTable.conversationId, id));
    await db.update(conversationsTable).set({ messageCount: total, updatedAt: new Date() }).where(eq(conversationsTable.id, id));
    res.json(msg);
  } catch (err) {
    req.log.error({ err }, "Failed to save message");
    res.status(500).json({ error: "Failed to save message" });
  }
});

export default router;
