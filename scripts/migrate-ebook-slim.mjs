/**
 * Drops unused ebook_pages columns (Brevo iframe owns form labels).
 * Run after deploying the slim ebook-page schema:
 *   node scripts/migrate-ebook-slim.mjs
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

const DROP_COLS = [
  "first_name",
  "last_name",
  "email",
  "privacy_consent_before",
  "privacy_consent_link",
  "privacy_consent_after",
  "submit",
  "form_submitting",
  "form_error",
  "form_validation",
];

await client.connect();
for (const col of DROP_COLS) {
  try {
    await client.query(`ALTER TABLE ebook_pages DROP COLUMN IF EXISTS ${col}`);
    console.log(`  dropped column: ${col}`);
  } catch (e) {
    console.warn(`  ${col}: ${e.message}`);
  }
}
await client.end();
console.log("\nDone.");
