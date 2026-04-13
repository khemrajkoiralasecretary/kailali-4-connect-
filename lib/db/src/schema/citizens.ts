import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const citizensTable = pgTable("citizens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  ward: integer("ward").notNull(),
  palika: text("palika").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Citizen = typeof citizensTable.$inferSelect;
