import { Router } from "express";
import { db, teamApplicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyToken, extractToken } from "./citizens";

const router = Router();

router.get("/", async (req, res) => {
  const { status } = req.query;

  let results = await db
    .select()
    .from(teamApplicationsTable)
    .orderBy(teamApplicationsTable.createdAt);

  if (status && typeof status === "string") {
    results = results.filter(a => a.status === status);
  }

  return res.json(results.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const { name, phone, ward, palika, skills, message } = req.body ?? {};

  if (!name || !phone || !ward || !palika || !skills) {
    return res.status(400).json({ error: "name, phone, ward, palika, and skills are required" });
  }

  const token = extractToken(req.headers.authorization);
  const payload = token ? verifyToken(token) : null;
  const citizenId = payload?.citizenId ?? null;

  const [application] = await db
    .insert(teamApplicationsTable)
    .values({
      name,
      phone,
      ward: Number(ward),
      palika,
      skills,
      message: message ?? null,
      citizenId,
      status: "pending",
    })
    .returning();

  return res.status(201).json({
    ...application,
    createdAt: application.createdAt.toISOString(),
  });
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { status } = req.body ?? {};
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const [updated] = await db
    .update(teamApplicationsTable)
    .set({ status })
    .where(eq(teamApplicationsTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Application not found" });

  return res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const deleted = await db
    .delete(teamApplicationsTable)
    .where(eq(teamApplicationsTable.id, id))
    .returning();

  return res.json({ deleted: deleted.length });
});

export default router;
