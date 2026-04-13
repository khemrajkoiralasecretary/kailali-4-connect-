import { Router } from "express";
import { db, eventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const events = await db
    .select()
    .from(eventsTable)
    .orderBy(eventsTable.createdAt);
  return res.json(events.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })));
});

router.post("/", async (req, res) => {
  const { title, description, eventType, imageUrl, eventDate } = req.body;
  if (!title || !description || !eventType) {
    return res.status(400).json({ error: "title, description, and eventType are required" });
  }
  const [item] = await db.insert(eventsTable).values({ title, description, eventType, imageUrl, eventDate }).returning();
  return res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const { title, description, eventType, imageUrl, eventDate } = req.body;
  const patch: Record<string, unknown> = {};
  if (title !== undefined) patch.title = title;
  if (description !== undefined) patch.description = description;
  if (eventType !== undefined) patch.eventType = eventType;
  if (imageUrl !== undefined) patch.imageUrl = imageUrl;
  if (eventDate !== undefined) patch.eventDate = eventDate;
  const [updated] = await db.update(eventsTable).set(patch).where(eq(eventsTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Event not found" });
  return res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const result = await db.delete(eventsTable).where(eq(eventsTable.id, id));
  return res.json({ deleted: result.rowCount ?? 1 });
});

export default router;
