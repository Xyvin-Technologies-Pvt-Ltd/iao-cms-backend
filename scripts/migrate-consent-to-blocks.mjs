/**
 * Migrates Contact form + Newsletter page from three string consent fields
 * to a single `consent` JSONB (Strapi Blocks) column.
 *
 * Run after updating schema.json / restarting Strapi:
 *   node scripts/migrate-consent-to-blocks.mjs
 *
 * Requires DATABASE_* from .env or edit client config below.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(relPath) {
  const envPath = path.resolve(__dirname, "..", relPath);
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env");

const { Client } = pg;
const client = new Client({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function columnExists(table, col) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, col]
  );
  return r.rowCount > 0;
}

async function run() {
  await client.connect();

  // ── components_contact_forms ─────────────────────────────────────────────
  const contactTable = "components_contact_forms";
  if (await columnExists(contactTable, "id")) {
    await client.query(`ALTER TABLE "${contactTable}" ADD COLUMN IF NOT EXISTS consent JSONB`);
    if (await columnExists(contactTable, "consent_before")) {
      await client.query(
        `ALTER TABLE "${contactTable}" DROP COLUMN IF EXISTS consent_before,
         DROP COLUMN IF EXISTS consent_link_text,
         DROP COLUMN IF EXISTS consent_after`
      );
      console.log("✓ components_contact_forms: dropped legacy consent string columns");
    } else {
      console.log("– components_contact_forms: legacy columns already absent");
    }
  } else {
    console.log("– components_contact_forms: table missing (Strapi will create on sync)");
  }

  // ── newsletter_pages ─────────────────────────────────────────────────────
  const nlTable = "newsletter_pages";
  if (!(await columnExists(nlTable, "id"))) {
    console.log("– newsletter_pages: table missing, skip");
  } else {
    await client.query(`ALTER TABLE "${nlTable}" ADD COLUMN IF NOT EXISTS consent JSONB`);
    if (await columnExists(nlTable, "consent_before")) {
      await client.query(
        `ALTER TABLE "${nlTable}" DROP COLUMN IF EXISTS consent_before,
         DROP COLUMN IF EXISTS consent_link_text,
         DROP COLUMN IF EXISTS consent_after`
      );
      console.log("✓ newsletter_pages: dropped legacy consent string columns");
    } else {
      console.log("– newsletter_pages: legacy consent columns already absent");
    }
  }

  await client.end();
  console.log("\nDone.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
