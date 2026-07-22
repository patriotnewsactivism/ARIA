import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable, agentTable, memoryTable, actionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
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

    // Pull persistent memory (pinned facts first, then most recent) so ARIA
    // actually recalls things across conversations instead of starting cold
    // every time. `memoryTable` previously had CRUD routes but was never read
    // anywhere — this is the wiring that makes it a real capability.
    const memories = await db
      .select()
      .from(memoryTable)
      .orderBy(desc(memoryTable.pinned), desc(memoryTable.updatedAt))
      .limit(30);

    let systemPrompt = agent.systemPrompt;
    if (memories.length > 0) {
      const byCategory: Record<string, string[]> = {};
      for (const m of memories) {
        (byCategory[m.category] ??= []).push(`- ${m.key}: ${m.value}`);
      }
      const memoryBlock = Object.entries(byCategory)
        .map(([cat, lines]) => `[${cat}]\n${lines.join("\n")}`)
        .join("\n\n");
      systemPrompt = `${agent.systemPrompt}\n\n--- Things you remember (persistent memory, use naturally, don't just recite) ---\n${memoryBlock}`;
    }

    // Build messages for OpenAI
    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
      { role: "user", content },
    ];

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    // Primary: OpenAI gpt-4.1. Falls back to OpenRouter's free tier
    // (same day as Apex/codeforge-v2) if the primary call fails before
    // any content streams -- e.g. rate limit or auth error -- so a
    // single provider outage doesn't take chat down entirely. Uses
    // plain fetch (no new npm dependency) since OpenRouter's
    // chat/completions SSE shape is OpenAI-compatible.
    let openaiStream;
    try {
      openaiStream = await openai.chat.completions.create({
        model: "gpt-4.1",
        max_completion_tokens: 8192,
        messages: chatMessages,
        stream: true,
      });
    } catch (primaryErr) {
      req.log.warn({ err: primaryErr }, "Primary OpenAI call failed, falling back to OpenRouter free tier");
      const orKey = process.env.OPENROUTER_API_KEY;
      if (!orKey) throw primaryErr;

      const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${orKey}`,
          "HTTP-Referer": "https://aria.donmatthews.live",
          "X-Title": "ARIA",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b:free",
          messages: chatMessages,
          stream: true,
          max_tokens: 8192,
        }),
      });
      if (!orRes.ok || !orRes.body) throw primaryErr;

      const reader = orRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const payload = trimmed.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullResponse += delta;
              res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
            }
          } catch {
            // Ignore malformed SSE chunks (e.g. keep-alive comments)
          }
        }
      }
      openaiStream = null;
    }

    if (openaiStream) {
      for await (const chunk of openaiStream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }
    }

    // Save assistant response
    await db.insert(messagesTable).values({ conversationId: id, role: "assistant", content: fullResponse });

    // Record to the activity feed so chat interactions show up alongside
    // other agent actions (tasks/shell/workflows) instead of being invisible.
    await db.insert(actionsTable).values({
      type: "chat_reply",
      description: content.length > 80 ? `${content.slice(0, 80)}...` : content,
      metadata: JSON.stringify({ conversationId: id }),
      status: "success",
    }).catch((err) => {
      req.log.warn({ err }, "Failed to record chat action to feed (non-fatal)");
    });

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
