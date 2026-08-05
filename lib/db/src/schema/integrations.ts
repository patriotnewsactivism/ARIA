import { pgTable, text, boolean, serial, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const integrationsTable = pgTable("integrations", {
  id:          serial("id").primaryKey(),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description").notNull(),
  category:    text("category").notNull(), // productivity | communication | developer | finance | crm | storage | calendar
  status:      text("status").notNull().default("disconnected"), // connected | disconnected | error | pending
  iconUrl:     text("icon_url"),
  scopes:      text("scopes"),
  connectedAt: timestamp("connected_at"),
  lastUsedAt:  timestamp("last_used_at"),
  enabled:     boolean("enabled").notNull().default(false),
  accessToken:    text("access_token"),
  refreshToken:   text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  lastError:      text("last_error"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  statusCheck: check("integrations_status_check", sql`${table.status} IN ('connected', 'disconnected', 'error', 'pending')`),
}));

export const insertIntegrationSchema = createInsertSchema(integrationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrationsTable.$inferSelect;
