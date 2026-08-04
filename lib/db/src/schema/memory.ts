import { pgTable, text, boolean, serial, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const memoryTable = pgTable("memory", {
  id:        serial("id").primaryKey(),
  key:       text("key").notNull(),
  value:     text("value").notNull(),
  category:  text("category").notNull().default("general"),
  pinned:    boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("memory_category_idx").on(table.category),
  index("memory_pinned_updated_idx").on(table.pinned, table.updatedAt),
]);

export const insertMemorySchema = createInsertSchema(memoryTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type MemoryEntry = typeof memoryTable.$inferSelect;
