/**
 * grant-programme-lecturers-page-permissions.mjs
 *
 * Idempotently grants Public (find, findOne) and Authenticated (CRUD) for
 * api::programme-lecturers-page.programme-lecturers-page.
 *
 *   node scripts/grant-programme-lecturers-page-permissions.mjs
 *   node scripts/grant-programme-lecturers-page-permissions.mjs --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createStrapi } = require('@strapi/strapi');
const {
  ensureProgrammeLecturersPagePermissions,
  ACTIONS_BY_ROLE,
} = require('../src/utils/programme-lecturers-page-permissions.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(relPath) {
  const envPath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx < 0) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const isDryRun = process.argv.includes('--dry-run');

async function main() {
  loadEnvFile('.env');
  console.log(`\nGrant programme-lecturers-page permissions (${isDryRun ? 'DRY RUN' : 'APPLY'})\n`);

  const strapi = await createStrapi();
  await strapi.load();

  if (isDryRun) {
    console.log(JSON.stringify(ACTIONS_BY_ROLE, null, 2));
    await strapi.destroy();
    return;
  }

  const created = await ensureProgrammeLecturersPagePermissions(strapi);
  console.log(`\nDone. ${created} new permission(s) created.\n`);
  await strapi.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
