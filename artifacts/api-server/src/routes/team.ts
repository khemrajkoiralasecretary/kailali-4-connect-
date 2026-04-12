import { Router } from "express";
import { db, teamMembersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod/v4";

const router = Router();

const JoinTeamBody = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  palika: z.string().min(1),
  ward: z.number().int().positive(),
  photoUrl: z.string().optional(),
});

const ListQueryParams = z.object({
  palika: z.string().optional(),
  rank: z.enum(["volunteer", "coordinator", "leader"]).optional(),
});

const UpdateRankBody = z.object({
  rank: z.enum(["volunteer", "coordinator", "leader"]),
});

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
  const parsed = ListQueryParams.safeParse(req.query);
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

router.patch("/:id/rank", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid ID" });

  const parsed = UpdateRankBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

  const [updated] = await db
    .update(teamMembersTable)
    .set({ rank: parsed.data.rank })
    .where(eq(teamMembersTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Member not found" });

  return res.json(formatMember(updated));
});

export default router;
