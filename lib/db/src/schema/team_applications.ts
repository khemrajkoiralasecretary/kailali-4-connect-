import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);

export const teamApplicationsTable = pgTable("team_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  ward: integer("ward").notNull(),
  palika: text("palika").notNull(),
  skills: text("skills").notNull(),
  message: text("message"),
  citizenId: integer("citizen_id"),
  status: applicationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type TeamApplication = typeof teamApplicationsTable.$inferSelect;
