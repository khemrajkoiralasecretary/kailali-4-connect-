import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const complaintStatusEnum = pgEnum("complaint_status", ["pending", "in_progress", "resolved"]);

export const complaintsTable = pgTable("complaints", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  ward: integer("ward").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  status: complaintStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertComplaintSchema = createInsertSchema(complaintsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaintsTable.$inferSelect;
