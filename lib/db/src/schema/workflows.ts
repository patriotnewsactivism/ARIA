import { pgTable, text, boolean, integer, serial, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workflowsTable = pgTable("workflows", {
  id:          serial("id").primaryKey(),
  name:        text("name").notNull(),
  description: text("description"),
  trigger:     text("trigger").notNull(),
  steps:       text("steps").notNull(),
  enabled:     boolean("enabled").notNull().default(true),
  lastRunAt:   timestamp("last_run_at"),
  runCount:    integer("run_count").notNull().default(0),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  triggerCheck: check("workflows_trigger_check", sql`${table.trigger} IN ('manual', 'schedule', 'webhook', 'event')`),
}));

export const insertWorkflowSchema = createInsertSchema(workflowsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflowsTable.$inferSelect;
