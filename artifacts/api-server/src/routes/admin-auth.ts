import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const router = Router();

const JWT_SECRET = process.env["SESSION_SECRET"] ?? "kailali4-secret-fallback";
const SALT_ROUNDS = 10;

const DEFAULT_ADMIN_PW = "1234";
const DEFAULT_STAFF_PW = "1111";

export type AdminRole = "super_admin" | "staff";

export interface AdminPayload {
  role: AdminRole;
  username: string;
}

function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    if (decoded.role !== "super_admin" && decoded.role !== "staff") return null;
    return { role: decoded.role as AdminRole, username: decoded.username as string };
  } catch {
    return null;
  }
}

function extractAdminToken(req: Request): string | null {
  const header = req.headers["x-admin-token"];
  if (typeof header === "string" && header.trim()) return header.trim();
  return null;
}

// Middleware: allow super_admin OR staff
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractAdminToken(req);
  if (!token) return res.status(401).json({ error: "Admin authentication required" });
  const payload = verifyAdminToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired admin token" });
  (req as Request & { adminPayload: AdminPayload }).adminPayload = payload;
  next();
}

// Middleware: allow super_admin ONLY
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractAdminToken(req);
  if (!token) return res.status(401).json({ error: "Admin authentication required" });
  const payload = verifyAdminToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired admin token" });
  if (payload.role !== "super_admin") return res.status(403).json({ error: "Permission denied — Super Admin only" });
  (req as Request & { adminPayload: AdminPayload }).adminPayload = payload;
  next();
}

// ── GET STORED HASH ──────────────────────────────────────────────────────────
async function getPasswordHash(key: string): Promise<string | null> {
  const rows = await db
    .select({ value: siteSettingsTable.value })
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, key))
    .limit(1);
  return rows[0]?.value ?? null;
}

async function setPasswordHash(key: string, hash: string): Promise<void> {
  const existing = await db
    .select({ key: siteSettingsTable.key })
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db.update(siteSettingsTable).set({ value: hash }).where(eq(siteSettingsTable.key, key));
  } else {
    await db.insert(siteSettingsTable).values({ key, value: hash });
  }
}

async function validatePassword(username: "admin" | "staff", password: string): Promise<boolean> {
  const key = username === "admin" ? "admin_password_hash" : "staff_password_hash";
  const storedHash = await getPasswordHash(key);

  if (!storedHash) {
    // No hash in DB — compare against defaults
    const defaultPw = username === "admin" ? DEFAULT_ADMIN_PW : DEFAULT_STAFF_PW;
    return password === defaultPw;
  }

  return bcrypt.compare(password, storedHash);
}

// ── POST /api/admin/login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username !== "admin" && username !== "staff") {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const valid = await validatePassword(username as "admin" | "staff", password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const role: AdminRole = username === "admin" ? "super_admin" : "staff";
  const token = signAdminToken({ role, username });

  return res.json({ token, role, username });
});

// ── POST /api/admin/change-password ─────────────────────────────────────────
router.post("/change-password", requireSuperAdmin, async (req, res) => {
  const { account, currentPassword, newPassword } = req.body ?? {};

  if (!account || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "account, currentPassword, and newPassword are required" });
  }

  if (account !== "admin" && account !== "staff") {
    return res.status(400).json({ error: "account must be 'admin' or 'staff'" });
  }

  if (typeof newPassword !== "string" || newPassword.length < 4) {
    return res.status(400).json({ error: "New password must be at least 4 characters" });
  }

  const valid = await validatePassword(account as "admin" | "staff", currentPassword);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const key = account === "admin" ? "admin_password_hash" : "staff_password_hash";
  await setPasswordHash(key, hash);

  return res.json({ success: true });
});

export default router;
