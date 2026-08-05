import { pgTable, text, serial, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tasksTable = pgTable("tasks", {
  id:          serial("id").primaryKey(),
  title:       text("title").notNull(),
  description: text("description"),
  status:      text("status").notNull().default("pending"),   // pending | in_progress | completed | failed | cancelled
  priority:    text("priority").notNull().default("medium"),  // low | medium | high | urgent
  dueAt:       timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  tags:        text("tags"),
  result:      text("result"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tasksStatusCheck: check("tasks_status_check", sql`${table.status} IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')`),
  tasksPriorityCheck: check("tasks_priority_check", sql`${table.priority} IN ('low', 'medium', 'high', 'urgent')`),
}));

export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
