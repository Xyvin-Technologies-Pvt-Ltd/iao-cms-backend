/**
 * migrate-lecturers-page-departments-to-components.mjs
 *
 * Migrates api::lecturers-page.lecturers-page from legacy JSON `departments`
 * to repeatable components (`lecturers-page.department` → `lecturers-page.lecturer`).
 *
 * ---------------------------------------------------------------------------
 * DATA SAFETY
 * ---------------------------------------------------------------------------
 * Before deploying the schema that removes JSON `departments`, backup SQL:
 *
 *   ALTER TABLE lecturers_page
 *     ADD COLUMN IF NOT EXISTS departments_migration_backup jsonb;
 *   UPDATE lecturers_page
 *     SET departments_migration_backup = departments::jsonb
 *     WHERE departments_migration_backup IS NULL
 *       AND departments IS NOT NULL;
 *
 * Optional (preserves breadcrumb string if the column is dropped later):
 *   ALTER TABLE lecturers_page
 *     ADD COLUMN IF NOT EXISTS breadcrumb_migration_backup varchar(255);
 *   UPDATE lecturers_page
 *     SET breadcrumb_migration_backup = breadcrumb
 *     WHERE breadcrumb_migration_backup IS NULL AND breadcrumb IS NOT NULL;
 *
 * Reads legacy departments from (first match per locale):
 *   - `departments_migration_backup` (jsonb), or legacy JSON column `departments`
 *   - `--legacy-json=` file (see below)
 *
 * ---------------------------------------------------------------------------
 * Legacy JSON shape
 * ---------------------------------------------------------------------------
 * departments: stringified JSON or array of:
 *   { name, title?, lecturers?: [{ name, role, photo?, credentials? }] }
 * Optional department hero: hero_image | hero | image (URL or media id)
 *
 * `--legacy-json` file:
 *   { "en": { "breadcrumb"|"breadcrumb_label", "page_title", "departments" }, "nl": { ... } }
 *   OR { "locales": { "en": { ... } } }
 *
 * ---------------------------------------------------------------------------
 * REST populate (nested media)
 * ---------------------------------------------------------------------------
 *   GET /api/lecturers-page?locale=en
 *     &populate[departments][populate][hero_image]=true
 *     &populate[departments][populate][lecturers][populate][photo]=true
 *
 * ---------------------------------------------------------------------------
 * Photo → Media: numeric id passes through; strings match `files.url` / basename
 * (no download/upload). Unmatched → warning, photo omitted.
 *
 *   node scripts/migrate-lecturers-page-departments-to-components.mjs --dry-run
 *   node scripts/migrate-lecturers-page-departments-to-components.mjs
 *   node scripts/migrate-lecturers-page-departments-to-components.mjs --legacy-json=./backup.json
 *   node scripts/migrate-lecturers-page-departments-to-components.mjs --force
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createStrapi } from "@strapi/strapi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UID = "api::lecturers-page.lecturers-page";

const LEGACY_BACKUP_COL = "departments_migration_backup";
const BREADCRUMB_BACKUP_COL = "breadcrumb_migration_backup";

function loadEnvFile(relPath) {
  const envPath = path.resolve(__dirname, "..", relPath);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf("=");
    if (idx < 0) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

function argvFlag(name) {
  return process.argv.includes(name);
}

function argvValue(prefix) {
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (!hit) return null;
  const eq = hit.indexOf("=");
  return eq === -1 ? null : hit.slice(eq + 1).trim();
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function asObj(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function clean(value) {
  if (value == null) return "";
  return String(value).trim();
}

function parseMaybeJson(value) {
  if (value == null) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function normalizeDepartmentsJson(raw) {
  const parsed = parseMaybeJson(raw) ?? raw;
  const list = asArray(parsed);
  const out = [];
  for (const item of list) {
    if (typeof item === "string") {
      const nested = parseMaybeJson(item);
      if (nested) out.push(...normalizeDepartmentsJson(nested));
      continue;
    }
    const d = asObj(item);
    const title = clean(d.name ?? d.title ?? d.heading ?? d.label);
    const lecturersRaw = d.lecturers ?? d.items ?? d.people ?? [];
    const lecturers = [];
    for (const l of asArray(lecturersRaw)) {
      const o = asObj(l);
      const name = clean(o.name ?? o.full_name ?? o.title);
      const role = clean(o.role ?? o.position ?? o.subtitle ?? "");
      const credentials = clean(o.credentials ?? o.professional_title ?? o.degree ?? "");
      const photo = o.photo ?? o.image ?? o.avatar ?? o.picture ?? null;
      if (name || role || credentials || photo) {
        lecturers.push({ name, role, credentials, photo });
      }
    }
    const heroCandidate = d.hero_image ?? d.hero ?? d.image ?? null;
    out.push({ title, lecturers, heroCandidate });
  }
  return out;
}

async function resolveTableName(knex) {
  const { rows } = await knex.raw(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('lecturers_page', 'lecturers_pages')
    ORDER BY CASE table_name WHEN 'lecturers_page' THEN 0 ELSE 1 END
  `);
  if (rows.length) return rows[0].table_name;
  return "lecturers_page";
}

async function columnInfo(knex, table, col) {
  const { rows } = await knex.raw(
    `
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ? AND column_name = ?
  `,
    [table, col]
  );
  return rows[0] || null;
}

async function readLegacyRowsFromDb(knex, table) {
  const backupType = await columnInfo(knex, table, LEGACY_BACKUP_COL);
  const deptType = await columnInfo(knex, table, "departments");

  const legacyDeptCol =
    backupType && (backupType.data_type === "jsonb" || backupType.data_type === "json")
      ? LEGACY_BACKUP_COL
      : deptType && (deptType.data_type === "jsonb" || deptType.data_type === "json")
        ? "departments"
        : null;

  if (!legacyDeptCol) return { rows: [] };

  const breadBackup = await columnInfo(knex, table, BREADCRUMB_BACKUP_COL);
  const breadOld = await columnInfo(knex, table, "breadcrumb");
  const breadNew = await columnInfo(knex, table, "breadcrumb_label");
  const pageTitleType = await columnInfo(knex, table, "page_title");

  let breadExpr = "NULL::text as breadcrumb_value";
  if (breadBackup) breadExpr = `${BREADCRUMB_BACKUP_COL} as breadcrumb_value`;
  else if (breadNew) breadExpr = `breadcrumb_label as breadcrumb_value`;
  else if (breadOld) breadExpr = `breadcrumb as breadcrumb_value`;

  const selectParts = ["document_id", "locale", `${legacyDeptCol} as legacy_departments`, breadExpr];
  if (pageTitleType) selectParts.push("page_title");

  const sql = `SELECT ${selectParts.join(", ")} FROM ${table}`;
  const { rows } = await knex.raw(sql);
  return { rows };
}

function loadLegacyJsonFile(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Legacy JSON file not found: ${abs}`);
  }
  return JSON.parse(fs.readFileSync(abs, "utf-8"));
}

function filePayloadToRows(raw) {
  const byLocale = {};
  if (raw.locales && typeof raw.locales === "object") {
    Object.assign(byLocale, raw.locales);
  } else {
    for (const [k, v] of Object.entries(raw)) {
      if (k === "documentId" || k === "meta") continue;
      if (v && typeof v === "object" && ("departments" in v || "breadcrumb" in v || "page_title" in v || "breadcrumb_label" in v)) {
        byLocale[k] = v;
      }
    }
  }
  const rows = [];
  for (const [locale, payload] of Object.entries(byLocale)) {
    rows.push({
      document_id: raw.documentId ?? null,
      locale,
      legacy_departments: payload.departments,
      breadcrumb_value: clean(payload.breadcrumb_label ?? payload.breadcrumb ?? ""),
      page_title: clean(payload.page_title ?? ""),
    });
  }
  return rows;
}

async function findMediaIdByUrlHint(strapi, rawUrl, knex, warnings) {
  if (rawUrl == null || rawUrl === "") return null;
  if (typeof rawUrl === "number" && Number.isFinite(rawUrl)) return rawUrl;
  if (typeof rawUrl === "object") {
    const id = rawUrl.id;
    if (typeof id === "number") return id;
    if (rawUrl.data && typeof rawUrl.data.id === "number") return rawUrl.data.id;
  }
  const url = String(rawUrl).trim();
  if (!url) return null;

  try {
    const exact = await strapi.db.query("plugin::upload.file").findOne({ where: { url } });
    if (exact?.id) return exact.id;
  } catch {
    /* ignore */
  }

  let pathname = url;
  try {
    pathname = new URL(url).pathname;
  } catch {
    /* keep */
  }
  const base = path.posix.basename(pathname);
  if (!base) return null;

  try {
    const hit = await knex("files").whereILike("url", `%${base.replace(/%/g, "\\%")}%`).first();
    if (hit?.id) return hit.id;
  } catch {
    warnings.push(`photo: files table query failed for basename=${base}`);
    return null;
  }

  warnings.push(`photo: no Media match for basename=${base}`);
  return null;
}

async function resolveHero(strapi, heroCandidate, knex, warnings) {
  if (heroCandidate == null || heroCandidate === "") return null;
  if (typeof heroCandidate === "number") return heroCandidate;
  if (typeof heroCandidate === "object" && heroCandidate.id) return heroCandidate.id;
  return findMediaIdByUrlHint(strapi, heroCandidate, knex, warnings);
}

async function buildDepartmentPayload(normalizedDepts, strapi, knex, warnings) {
  const blocks = [];
  for (const d of normalizedDepts) {
    const title = d.title || (d.lecturers.length ? "Untitled" : "");
    if (!title) continue;

    const heroId = await resolveHero(strapi, d.heroCandidate, knex, warnings);
    const lecturers = [];
    for (const l of d.lecturers) {
      const name = l.name || "Unknown";
      const role = l.role || "";
      const entry = { name, role };
      const pt = clean(l.credentials);
      if (pt) entry.professional_title = pt;
      const photoId = await findMediaIdByUrlHint(strapi, l.photo, knex, warnings);
      if (photoId != null) entry.photo = photoId;
      lecturers.push(entry);
    }

    const block = { title, lecturers };
    if (heroId != null) block.hero_image = heroId;
    blocks.push(block);
  }
  return blocks;
}

function hasComponentData(entry) {
  const d = entry?.departments;
  return Array.isArray(d) && d.length > 0;
}

function legacyDepartmentsEmpty(raw) {
  if (raw == null) return true;
  const norm = normalizeDepartmentsJson(raw);
  return norm.length === 0 || norm.every((x) => !x.title && x.lecturers.length === 0);
}

async function listLocales(strapi) {
  try {
    const locSvc = await strapi.plugin("i18n").service("locales").find();
    return locSvc.map((l) => l.code);
  } catch {
    return ["en"];
  }
}

const populateDept = [
  "departments",
  "departments.hero_image",
  "departments.lecturers",
  "departments.lecturers.photo",
];

async function main() {
  loadEnvFile(".env");
  const isDryRun = argvFlag("--dry-run");
  const isForce = argvFlag("--force");
  const legacyJsonPath = argvValue("--legacy-json=");

  console.log(`\nlecturers-page departments → components (${isDryRun ? "DRY RUN" : "APPLY"})`);

  const strapi = await createStrapi();
  await strapi.load();

  const knex = strapi.db.connection;
  const table = await resolveTableName(knex);
  console.log(`Using SQL table: ${table}`);

  let dbRows = [];
  try {
    const bundle = await readLegacyRowsFromDb(knex, table);
    dbRows = bundle.rows || [];
  } catch (e) {
    console.log(`DB legacy read failed: ${e.message}`);
  }

  let fileRows = [];
  if (legacyJsonPath) {
    fileRows = filePayloadToRows(loadLegacyJsonFile(legacyJsonPath));
    console.log(`Loaded ${fileRows.length} locale row(s) from --legacy-json`);
  }

  const perLocale = new Map();
  for (const r of dbRows) {
    if (!r.locale) continue;
    perLocale.set(r.locale, {
      legacy_departments: r.legacy_departments,
      breadcrumb_value: clean(r.breadcrumb_value),
      page_title: clean(r.page_title),
      source: "db",
    });
  }
  for (const r of fileRows) {
    if (!r.locale) continue;
    perLocale.set(r.locale, {
      legacy_departments: r.legacy_departments,
      breadcrumb_value: clean(r.breadcrumb_value),
      page_title: clean(r.page_title),
      source: "file",
    });
  }

  const allLocales = await listLocales(strapi);

  if (perLocale.size === 0) {
    console.log(
      "\nNo legacy departments source found (no JSON/backup SQL columns and no --legacy-json). Nothing to migrate."
    );
    await strapi.destroy();
    return;
  }

  const localesToProcess = [...perLocale.keys()];
  const seedLocale = localesToProcess[0] || allLocales[0];

  const baseEntry = await strapi.documents(UID).findFirst({
    locale: seedLocale,
    populate: populateDept,
  });
  const documentId = baseEntry?.documentId;
  if (!documentId) {
    console.error("No lecturers-page document found. Create the single type in Admin first.");
    await strapi.destroy();
    process.exitCode = 1;
    return;
  }

  const summary = { locales: 0, migrated: 0, skipped: 0, errors: 0, warnings: 0 };

  for (const locale of localesToProcess) {
    summary.locales += 1;
    const warnings = [];
    try {
      const entry = await strapi.documents(UID).findFirst({
        locale,
        populate: populateDept,
      });

      const pack = perLocale.get(locale);
      const departmentsSource = pack?.legacy_departments ?? null;
      const breadcrumbFromPack = pack?.breadcrumb_value ?? "";
      const pageTitleFromPack = pack?.page_title ?? "";

      const alreadyComponents = hasComponentData(entry);
      const legacyEmpty = legacyDepartmentsEmpty(departmentsSource);

      if (legacyEmpty) {
        summary.skipped += 1;
        console.log(`[${locale}] skip: empty legacy departments`);
        continue;
      }

      if (alreadyComponents && !isForce) {
        summary.skipped += 1;
        console.log(`[${locale}] skip: already has component data (use --force to rebuild from legacy)`);
        continue;
      }

      const normalized = normalizeDepartmentsJson(departmentsSource);
      const departmentBlocks = await buildDepartmentPayload(normalized, strapi, knex, warnings);

      const breadcrumb_label = clean(
        breadcrumbFromPack || entry?.breadcrumb_label || ""
      );
      const page_title = clean(pageTitleFromPack || entry?.page_title || "");

      const data = {
        departments: departmentBlocks,
        ...(breadcrumb_label ? { breadcrumb_label } : {}),
        ...(page_title ? { page_title } : {}),
      };

      if (warnings.length) {
        summary.warnings += warnings.length;
        for (const w of warnings) console.warn(`[${locale}] WARN ${w}`);
      }

      if (isDryRun) {
        summary.migrated += 1;
        console.log(
          `[${locale}] dry-run: ${departmentBlocks.length} department(s), breadcrumb_label=${Boolean(
            data.breadcrumb_label
          )}, page_title=${Boolean(data.page_title)}`
        );
        continue;
      }

      await strapi.documents(UID).update({
        documentId,
        locale,
        data,
      });

      summary.migrated += 1;
      console.log(`[${locale}] updated: ${departmentBlocks.length} department(s)`);
    } catch (err) {
      summary.errors += 1;
      console.error(`[${locale}] ERROR ${err.message}`);
    }
  }

  await strapi.destroy();

  console.log("\n--- Summary ---");
  console.log(JSON.stringify(summary, null, 2));
  if (summary.errors > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
