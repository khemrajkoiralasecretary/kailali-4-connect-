import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teamRankEnum = pgEnum("team_rank", ["volunteer", "coordinator", "leader"]);

export const teamMembersTable = pgTable("team_members", {
  id: serial("id").primaryKey(),
  cid: text("cid").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  palika: text("palika").notNull(),
  ward: integer("ward").notNull(),
  photoUrl: text("photo_url"),
  rank: teamRankEnum("rank").notNull().default("volunteer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembersTable).omit({ id: true, createdAt: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembersTable.$inferSelect;
