import { Router } from "express";
import { db, complaintsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListComplaintsQueryParams,
  CreateComplaintBody,
  UpdateComplaintStatusBody,
  GetComplaintParams,
  UpdateComplaintStatusParams,
} from "@workspace/api-zod";
import { verifyToken, extractToken } from "./citizens";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListComplaintsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }

  const { status, ward } = parsed.data;
  const conditions = [];
  if (status) conditions.push(eq(complaintsTable.status, status as "pending" | "in_progress" | "resolved"));
  if (ward) conditions.push(eq(complaintsTable.ward, ward));

  const complaints = await db
    .select()
    .from(complaintsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(complaintsTable.createdAt);

  return res.json(complaints.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const parsed = CreateComplaintBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const token = extractToken(req.headers.authorization);
  const payload = token ? verifyToken(token) : null;
  const citizenId = payload?.citizenId ?? null;

  const [complaint] = await db.insert(complaintsTable).values({
    ...parsed.data,
    palika: parsed.data.palika ?? "",
    citizenId,
  }).returning();

  return res.status(201).json({
    ...complaint,
    createdAt: complaint.createdAt.toISOString(),
    updatedAt: complaint.updatedAt.toISOString(),
  });
});

router.delete("/all", async (_req, res) => {
  const deleted = await db.delete(complaintsTable).returning();
  return res.json({ deleted: deleted.length });
});

router.get("/:id", async (req, res) => {
  const parsed = GetComplaintParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid complaint ID" });
  }

  const [complaint] = await db
    .select()
    .from(complaintsTable)
    .where(eq(complaintsTable.id, parsed.data.id));

  if (!complaint) return res.status(404).json({ error: "Complaint not found" });

  return res.json({
    ...complaint,
    createdAt: complaint.createdAt.toISOString(),
    updatedAt: complaint.updatedAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const parsed = GetComplaintParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid complaint ID" });

  const [deleted] = await db
    .delete(complaintsTable)
    .where(eq(complaintsTable.id, parsed.data.id))
    .returning();

  if (!deleted) return res.status(404).json({ error: "Complaint not found" });
  return res.json({ deleted: 1 });
});

router.patch("/:id", async (req, res) => {
  const paramsParsed = UpdateComplaintStatusParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid complaint ID" });
  }

  const bodyParsed = UpdateComplaintStatusBody.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const [updated] = await db
    .update(complaintsTable)
    .set({ status: bodyParsed.data.status as "pending" | "in_progress" | "resolved", updatedAt: new Date() })
    .where(eq(complaintsTable.id, paramsParsed.data.id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Complaint not found" });

  return res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

export default router;
