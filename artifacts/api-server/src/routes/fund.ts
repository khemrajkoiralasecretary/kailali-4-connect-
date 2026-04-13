import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireSuperAdmin } from "./admin-auth";

const router = Router();

const q = {
  donations: () => db.execute(sql`SELECT * FROM donations ORDER BY amount DESC`),
  expenses:  () => db.execute(sql`SELECT * FROM expenses  ORDER BY created_at DESC`),
  qr:        () => db.execute(sql`SELECT qr_url FROM fund_settings WHERE id = 1`),
};

// ── PUBLIC: summary ──────────────────────────────────────────────────────────
router.get("/summary", async (_req, res) => {
  const [d, e] = await Promise.all([q.donations(), q.expenses()]);
  const totalDonations = (d.rows as { amount: number }[]).reduce((a, r) => a + Number(r.amount), 0);
  const totalExpenses  = (e.rows as { amount: number }[]).reduce((a, r) => a + Number(r.amount), 0);
  return res.json({
    totalDonations,
    totalExpenses,
    balance: totalDonations - totalExpenses,
    donorCount: d.rows.length,
  });
});

// ── PUBLIC: donations ────────────────────────────────────────────────────────
router.get("/donations", async (_req, res) => {
  const result = await q.donations();
  return res.json(result.rows);
});

// ── ADMIN: add donation ──────────────────────────────────────────────────────
router.post("/donations", requireSuperAdmin, async (req, res) => {
  const { name, amount, date } = req.body ?? {};
  if (!name || !amount) return res.status(400).json({ error: "name and amount are required" });
  const n = Number(amount);
  if (isNaN(n) || n <= 0) return res.status(400).json({ error: "amount must be a positive number" });
  const d = date ?? new Date().toISOString().split("T")[0];
  const result = await db.execute(
    sql`INSERT INTO donations (name, amount, date) VALUES (${name}, ${n}, ${d}::date) RETURNING *`
  );
  return res.status(201).json(result.rows[0]);
});

// ── ADMIN: delete donation ───────────────────────────────────────────────────
router.delete("/donations/:id", requireSuperAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  await db.execute(sql`DELETE FROM donations WHERE id = ${id}`);
  return res.json({ deleted: true });
});

// ── PUBLIC: expenses ─────────────────────────────────────────────────────────
router.get("/expenses", async (_req, res) => {
  const result = await q.expenses();
  return res.json(result.rows);
});

// ── ADMIN: add expense ───────────────────────────────────────────────────────
router.post("/expenses", requireSuperAdmin, async (req, res) => {
  const { title, amount } = req.body ?? {};
  if (!title || !amount) return res.status(400).json({ error: "title and amount are required" });
  const n = Number(amount);
  if (isNaN(n) || n <= 0) return res.status(400).json({ error: "amount must be a positive number" });
  const result = await db.execute(
    sql`INSERT INTO expenses (title, amount) VALUES (${title}, ${n}) RETURNING *`
  );
  return res.status(201).json(result.rows[0]);
});

// ── ADMIN: delete expense ────────────────────────────────────────────────────
router.delete("/expenses/:id", requireSuperAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  await db.execute(sql`DELETE FROM expenses WHERE id = ${id}`);
  return res.json({ deleted: true });
});

// ── PUBLIC: QR ───────────────────────────────────────────────────────────────
router.get("/qr", async (_req, res) => {
  const result = await q.qr();
  const row = result.rows[0] as { qr_url: string | null } | undefined;
  return res.json({ qrUrl: row?.qr_url ?? null });
});

// ── ADMIN: set QR ────────────────────────────────────────────────────────────
router.post("/qr", requireSuperAdmin, async (req, res) => {
  const { qrUrl } = req.body ?? {};
  if (!qrUrl) return res.status(400).json({ error: "qrUrl is required" });
  await db.execute(sql`UPDATE fund_settings SET qr_url = ${qrUrl} WHERE id = 1`);
  return res.json({ qrUrl });
});

export default router;
