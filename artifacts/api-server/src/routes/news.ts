import { Router } from "express";
import { db, newsTable } from "@workspace/db";
import { CreateNewsBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  const news = await db
    .select()
    .from(newsTable)
    .orderBy(newsTable.publishedAt);

  return res.json(news.map(n => ({
    ...n,
    publishedAt: n.publishedAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const parsed = CreateNewsBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const [item] = await db.insert(newsTable).values(parsed.data).returning();

  return res.status(201).json({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
  });
});

export default router;
