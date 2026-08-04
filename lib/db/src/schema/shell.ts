import { pgTable, text, integer, serial, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shellSessionsTable = pgTable("shell_sessions", {
  id:           serial("id").primaryKey(),
  name:         text("name").notNull(),
  workingDir:   text("working_dir").notNull().default("/home"),
  status:       text("status").notNull().default("active"), // active | closed
  commandCount: integer("command_count").notNull().default(0),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

export const shellCommandsTable = pgTable("shell_commands", {
  id:         serial("id").primaryKey(),
  sessionId:  integer("session_id").notNull().references(() => shellSessionsTable.id, { onDelete: "cascade" }),
  command:    text("command").notNull(),
  output:     text("output"),
  exitCode:   integer("exit_code"),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
}, (table) => [
  index("shell_commands_session_id_idx").on(table.sessionId),
]);

export const insertShellSessionSchema = createInsertSchema(shellSessionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShellCommandSchema = createInsertSchema(shellCommandsTable).omit({ id: true });
export type InsertShellSession = z.infer<typeof insertShellSessionSchema>;
export type InsertShellCommand = z.infer<typeof insertShellCommandSchema>;
export type ShellSession = typeof shellSessionsTable.$inferSelect;
export type ShellCommand = typeof shellCommandsTable.$inferSelect;
