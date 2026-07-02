import { pgTable, text, integer, boolean, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentTable = pgTable("agent", {
  id:           serial("id").primaryKey(),
  name:         text("name").notNull().default("ARIA"),
  persona:      text("persona").notNull().default("You are ARIA, an autonomous AI coworker."),
  status:       text("status").notNull().default("online"),
  avatarUrl:    text("avatar_url"),
  timezone:     text("timezone").notNull().default("UTC"),
  language:     text("language").notNull().default("en"),
  systemPrompt: text("system_prompt").notNull().default("You are ARIA, a capable AI coworker that helps with tasks, code, writing, research, and business operations. Be concise, professional, and proactive."),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agentTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agentTable.$inferSelect;
