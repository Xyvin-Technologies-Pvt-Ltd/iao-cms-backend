/**
 * Drops legacy footer_label / footer_note columns from legal single-type tables
 * (field removed from Strapi schemas — nav/footer copy stays in frontend dictionaries).
 *
 *   node scripts/migrate-drop-footer-columns.mjs
 *
 * Uses DATABASE_* from .env (same as other migrate scripts).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(relPath) {
  const envPath = path.resolve(__dirname, "..", relPath);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
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

const TABLES = [
  "accessibility_pages",
  "cookies_pages",
  "privacy_pages",
  "disclaimer_pages",
  "terms_pages",
  "legal_notice_pages",
];

await client.connect();
for (const table of TABLES) {
  try {
    await client.query(
      `ALTER TABLE "${table}" DROP COLUMN IF EXISTS footer_label, DROP COLUMN IF EXISTS footer_note`
    );
    console.log(`✓ ${table}`);
  } catch (e) {
    console.warn(`– ${table}: ${e.message}`);
  }
}
await client.end();
console.log("\nDone.");
