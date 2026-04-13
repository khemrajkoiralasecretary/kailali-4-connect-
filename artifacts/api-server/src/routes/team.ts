import { Router } from "express";
import { db, teamMembersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListTeamMembersQueryParams,
  JoinTeamBody,
  UpdateTeamRankParams,
  UpdateTeamRankBody,
} from "@workspace/api-zod";

const router = Router();

function formatMember(m: typeof teamMembersTable.$inferSelect) {
  return {
    ...m,
    createdAt: m.createdAt.toISOString(),
  };
}

function generateCid(): string {
  return "CID-" + Math.floor(Math.random() * 100000).toString().padStart(5, "0");
}

router.get("/", async (req, res) => {
  const parsed = ListTeamMembersQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query params" });

  const { palika, rank } = parsed.data;
  const conditions = [];
  if (palika) conditions.push(eq(teamMembersTable.palika, palika));
  if (rank)   conditions.push(eq(teamMembersTable.rank, rank));

  const members = await db
    .select()
    .from(teamMembersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(teamMembersTable.createdAt);

  return res.json(members.map(formatMember));
});

router.post("/", async (req, res) => {
  const parsed = JoinTeamBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

  const cid = generateCid();

  const [member] = await db.insert(teamMembersTable).values({
    ...parsed.data,
    cid,
    rank: "volunteer",
  }).returning();

  return res.status(201).json(formatMember(member));
});

router.delete("/all", async (_req, res) => {
  const deleted = await db.delete(teamMembersTable).returning();
  return res.json({ deleted: deleted.length });
});

router.patch("/:id/rank", async (req, res) => {
  const paramsParsed = UpdateTeamRankParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) return res.status(400).json({ error: "Invalid ID" });

  const bodyParsed = UpdateTeamRankBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: "Invalid request body" });

  const [updated] = await db
    .update(teamMembersTable)
    .set({ rank: bodyParsed.data.rank })
    .where(eq(teamMembersTable.id, paramsParsed.data.id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Member not found" });

  return res.json(formatMember(updated));
});

export default router;
