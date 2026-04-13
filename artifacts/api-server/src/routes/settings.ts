import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const MP_NAME_KEY       = "mp_name";
const MP_MESSAGE_KEY    = "mp_message";
const MP_PHOTO_KEY      = "mp_photo_url";
const HOME_WELCOME_KEY  = "home_welcome";
const HOME_FOOTER_KEY   = "home_footer";

async function getSetting(key: string): Promise<string | null> {
  const [row] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
  return row?.value ?? null;
}

async function upsertSetting(key: string, value: string) {
  await db
    .insert(siteSettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value } });
}

router.get("/mp-profile", async (_req, res) => {
  const [name, message, photoUrl] = await Promise.all([
    getSetting(MP_NAME_KEY),
    getSetting(MP_MESSAGE_KEY),
    getSetting(MP_PHOTO_KEY),
  ]);
  return res.json({
    name:     name    ?? "Member of Parliament — Kailali-4",
    message:  message ?? "Serving with transparency, accountability, and dedication to the people of Kailali Constituency 4",
    photoUrl: photoUrl ?? null,
  });
});

router.patch("/mp-profile", async (req, res) => {
  const { name, message, photoUrl } = req.body as { name?: string; message?: string; photoUrl?: string };

  const ops: Promise<unknown>[] = [];
  if (name    !== undefined) ops.push(upsertSetting(MP_NAME_KEY,    name));
  if (message !== undefined) ops.push(upsertSetting(MP_MESSAGE_KEY, message));
  if (photoUrl !== undefined) ops.push(upsertSetting(MP_PHOTO_KEY,  photoUrl));
  await Promise.all(ops);

  const [savedName, savedMessage, savedPhoto] = await Promise.all([
    getSetting(MP_NAME_KEY),
    getSetting(MP_MESSAGE_KEY),
    getSetting(MP_PHOTO_KEY),
  ]);

  return res.json({
    name:     savedName    ?? "Member of Parliament — Kailali-4",
    message:  savedMessage ?? "Serving with transparency, accountability, and dedication to the people of Kailali Constituency 4",
    photoUrl: savedPhoto   ?? null,
  });
});

router.get("/home-content", async (_req, res) => {
  const [welcome, footer] = await Promise.all([
    getSetting(HOME_WELCOME_KEY),
    getSetting(HOME_FOOTER_KEY),
  ]);
  return res.json({
    welcome: welcome ?? "Kailali Constituency 4 — Digital Governance Platform",
    footer:  footer  ?? "Serving with Transparency",
  });
});

router.patch("/home-content", async (req, res) => {
  const { welcome, footer } = req.body as { welcome?: string; footer?: string };
  const ops: Promise<unknown>[] = [];
  if (welcome !== undefined) ops.push(upsertSetting(HOME_WELCOME_KEY, welcome));
  if (footer  !== undefined) ops.push(upsertSetting(HOME_FOOTER_KEY,  footer));
  await Promise.all(ops);

  const [savedWelcome, savedFooter] = await Promise.all([
    getSetting(HOME_WELCOME_KEY),
    getSetting(HOME_FOOTER_KEY),
  ]);
  return res.json({
    welcome: savedWelcome ?? "Kailali Constituency 4 — Digital Governance Platform",
    footer:  savedFooter  ?? "Serving with Transparency",
  });
});

export default router;
