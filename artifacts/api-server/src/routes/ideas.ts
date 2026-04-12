import { Router } from "express";
import { db, ideasTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateIdeaBody, UpvoteIdeaParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  const ideas = await db
    .select()
    .from(ideasTable)
    .orderBy(sql`${ideasTable.upvotes} DESC`);

  return res.json(ideas.map(i => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const parsed = CreateIdeaBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const [idea] = await db.insert(ideasTable).values(parsed.data).returning();

  return res.status(201).json({
    ...idea,
    createdAt: idea.createdAt.toISOString(),
  });
});

router.post("/:id/upvote", async (req, res) => {
  const parsed = UpvoteIdeaParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid idea ID" });
  }

  const [updated] = await db
    .update(ideasTable)
    .set({ upvotes: sql`${ideasTable.upvotes} + 1` })
    .where(eq(ideasTable.id, parsed.data.id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Idea not found" });

  return res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
