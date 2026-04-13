import { Router } from "express";
import { db, citizensTable, complaintsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env["SESSION_SECRET"] ?? "kailali4-secret-fallback";
const SALT_ROUNDS = 10;

function signToken(citizenId: number, email: string): string {
  return jwt.sign({ citizenId, email }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { citizenId: number; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { citizenId: number; email: string };
  } catch {
    return null;
  }
}

export function extractToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

router.post("/signup", async (req, res) => {
  const { name, phone, email, password, ward, palika } = req.body ?? {};

  if (!name || !phone || !email || !password || !ward || !palika) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existing = await db
    .select({ id: citizensTable.id })
    .from(citizensTable)
    .where(eq(citizensTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [citizen] = await db
    .insert(citizensTable)
    .values({ name, phone, email, passwordHash, ward: Number(ward), palika })
    .returning();

  const token = signToken(citizen.id, citizen.email);

  return res.status(201).json({
    token,
    citizen: {
      id: citizen.id,
      name: citizen.name,
      phone: citizen.phone,
      email: citizen.email,
      ward: citizen.ward,
      palika: citizen.palika,
      createdAt: citizen.createdAt.toISOString(),
    },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const [citizen] = await db
    .select()
    .from(citizensTable)
    .where(eq(citizensTable.email, email))
    .limit(1);

  if (!citizen) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, citizen.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(citizen.id, citizen.email);

  return res.json({
    token,
    citizen: {
      id: citizen.id,
      name: citizen.name,
      phone: citizen.phone,
      email: citizen.email,
      ward: citizen.ward,
      palika: citizen.palika,
      createdAt: citizen.createdAt.toISOString(),
    },
  });
});

router.get("/me", async (req, res) => {
  const token = extractToken(req.headers.authorization);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  const [citizen] = await db
    .select()
    .from(citizensTable)
    .where(eq(citizensTable.id, payload.citizenId))
    .limit(1);

  if (!citizen) return res.status(401).json({ error: "Citizen not found" });

  return res.json({
    id: citizen.id,
    name: citizen.name,
    phone: citizen.phone,
    email: citizen.email,
    ward: citizen.ward,
    palika: citizen.palika,
    createdAt: citizen.createdAt.toISOString(),
  });
});

router.get("/complaints", async (req, res) => {
  const token = extractToken(req.headers.authorization);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  const complaints = await db
    .select()
    .from(complaintsTable)
    .where(eq(complaintsTable.citizenId, payload.citizenId))
    .orderBy(complaintsTable.createdAt);

  return res.json(complaints.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })));
});

export default router;
