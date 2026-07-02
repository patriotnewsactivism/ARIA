import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable, agentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

// POST /conversations/:id/messages  — SSE streaming (mounted at /openai)
router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { content } = req.body as { content: string };

    // Fetch conversation + history
    const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(messagesTable.createdAt);

    // Get agent system prompt
    let [agent] = await db.select().from(agentTable).limit(1);
    if (!agent) {
      [agent] = await db.insert(agentTable).values({}).returning();
    }

    // Save user message
    await db.insert(messagesTable).values({ conversationId: id, role: "user", content });

    // Build messages for OpenAI
    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: agent.systemPrompt },
      ...history.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
      { role: "user", content },
    ];

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-4.1",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    // Save assistant response
    await db.insert(messagesTable).values({ conversationId: id, role: "assistant", content: fullResponse });

    // Update conversation stats
    const msgCount = history.length + 2;
    await db
      .update(conversationsTable)
      .set({ messageCount: msgCount, updatedAt: new Date() })
      .where(eq(conversationsTable.id, id));

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to stream OpenAI response");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to get AI response" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  }
});

export default router;
