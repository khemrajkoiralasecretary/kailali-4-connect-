import { Router } from "express";
import { db, complaintsTable, ideasTable, newsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/stats", async (_req, res) => {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${complaintsTable.status} = 'pending')::int`,
      inProgress: sql<number>`count(*) filter (where ${complaintsTable.status} = 'in_progress')::int`,
      resolved: sql<number>`count(*) filter (where ${complaintsTable.status} = 'resolved')::int`,
    })
    .from(complaintsTable);

  const [{ totalIdeas }] = await db
    .select({ totalIdeas: sql<number>`count(*)::int` })
    .from(ideasTable);

  const [{ totalNews }] = await db
    .select({ totalNews: sql<number>`count(*)::int` })
    .from(newsTable);

  return res.json({
    total: stats?.total ?? 0,
    pending: stats?.pending ?? 0,
    inProgress: stats?.inProgress ?? 0,
    resolved: stats?.resolved ?? 0,
    totalIdeas: totalIdeas ?? 0,
    totalNews: totalNews ?? 0,
  });
});

router.get("/ward-breakdown", async (_req, res) => {
  const breakdown = await db
    .select({
      ward: complaintsTable.ward,
      total: sql<number>`count(*)::int`,
      resolved: sql<number>`count(*) filter (where ${complaintsTable.status} = 'resolved')::int`,
    })
    .from(complaintsTable)
    .groupBy(complaintsTable.ward)
    .orderBy(complaintsTable.ward);

  return res.json(breakdown);
});

router.get("/recent-activity", async (_req, res) => {
  const complaints = await db
    .select({
      id: complaintsTable.id,
      type: sql<string>`'complaint'`,
      title: complaintsTable.category,
      description: complaintsTable.description,
      timestamp: complaintsTable.createdAt,
    })
    .from(complaintsTable)
    .orderBy(desc(complaintsTable.createdAt))
    .limit(5);

  const ideas = await db
    .select({
      id: ideasTable.id,
      type: sql<string>`'idea'`,
      title: ideasTable.title,
      description: ideasTable.description,
      timestamp: ideasTable.createdAt,
    })
    .from(ideasTable)
    .orderBy(desc(ideasTable.createdAt))
    .limit(3);

  const news = await db
    .select({
      id: newsTable.id,
      type: sql<string>`'news'`,
      title: newsTable.title,
      description: newsTable.content,
      timestamp: newsTable.publishedAt,
    })
    .from(newsTable)
    .orderBy(desc(newsTable.publishedAt))
    .limit(3);

  const all = [...complaints, ...ideas, ...news]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
    .map(item => ({
      ...item,
      timestamp: item.timestamp.toISOString(),
    }));

  return res.json(all);
});

export default router;
