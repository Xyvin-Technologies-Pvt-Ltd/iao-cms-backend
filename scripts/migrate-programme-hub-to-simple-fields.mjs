import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createStrapi } from "@strapi/strapi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UID_HUB = "api::programme-hub.programme-hub";

const HERO = { type: "programme.hero", table: "components_programme_heroes", field: "hero" };
const CURRICULUM = {
  type: "programme.curriculum",
  table: "components_programme_curriculums",
  field: "curriculum",
};
const FLEXIBLE = {
  type: "programme.flexible-study",
  table: "components_programme_flexible_studies",
  field: "flexible_study",
};
const LATERAL = {
  type: "programme.lateral-entry",
  table: "components_programme_lateral_entries",
  field: "lateral_entry",
};

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

function clean(value) {
  if (value == null) return "";
  return String(value).trim();
}

function joinParagraphs(parts) {
  return parts.map(clean).filter(Boolean).join("\n\n").trim();
}

function heading2(title) {
  const t = clean(title);
  return t ? `## ${t}` : "";
}

function buildLateralSentence(lateral) {
  if (!lateral || typeof lateral !== "object") return "";
  const emphasis = clean(lateral.emphasis);
  const bold = clean(lateral.bold);
  const before = clean(lateral.before);
  const label = clean(lateral.label);
  const href = clean(lateral.href);
  const after = clean(lateral.after);

  const linkText = label ? (href ? `[${label}](${href})` : label) : "";
  const prefix = [emphasis, bold].filter(Boolean).join(" ").trim();

  return clean([prefix, before, linkText, after].filter(Boolean).join(" "));
}

function buildContentFromLegacy(entry) {
  const parts = [];

  const curriculum = entry.curriculum;
  if (curriculum && typeof curriculum === "object") {
    parts.push(heading2(curriculum.title));
    parts.push(clean(curriculum.intro_line));
    parts.push(clean(curriculum.paragraph));
    parts.push(clean(curriculum.paragraph_2));
  }

  const flexible = entry.flexible_study;
  if (flexible && typeof flexible === "object") {
    parts.push(heading2(flexible.title));
    parts.push(clean(flexible.description));
    parts.push(clean(flexible.paragraph_1));
    parts.push(clean(flexible.paragraph_2));
  }

  const lateralSentence = buildLateralSentence(entry.lateral_entry);
  if (lateralSentence) parts.push(lateralSentence);

  return joinParagraphs(parts);
}

async function fetchSingleComponent(db, { entityId, field, type, table }) {
  const row = await db("programme_hubs_components")
    .select(["component_id"])
    .where({ entity_id: entityId, field, component_type: type })
    .orderBy("id", "asc")
    .first();

  if (!row?.component_id) return null;
  const component = await db(table).select("*").where({ id: row.component_id }).first();
  return component || null;
}

async function main() {
  loadEnvFile(".env");

  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");

  const strapi = await createStrapi();
  await strapi.load();

  const locales = await strapi.plugin("i18n")?.service("locales")?.find() ?? [];
  const localeCodes = locales.map((l) => l.code).filter(Boolean);
  const targetLocales = localeCodes.length ? localeCodes : [undefined];

  let inspected = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`\nprogramme-hub migration to simple fields (${dryRun ? "DRY RUN" : "APPLY"})`);
  console.log(`force: ${force ? "on" : "off"}`);

  const db = strapi.db.connection;

  for (const locale of targetLocales) {
    const hubRows = await db("programme_hubs")
      .select(["id", "document_id", "locale"])
      .modify((qb) => {
        if (locale) qb.where({ locale });
      })
      .orderBy("id", "asc");

    for (const row of hubRows) {
      inspected += 1;
      const documentId = row.document_id;
      const rowLocale = row.locale || locale;

      try {
        const hub = await strapi.documents(UID_HUB).findOne({
          documentId,
          ...(rowLocale ? { locale: rowLocale } : {}),
          populate: ["campus_cards", "campuses"],
        });

        if (!hub) {
          skipped += 1;
          console.log(`- skip ${documentId}${rowLocale ? `/${rowLocale}` : ""} (document not found)`);
          continue;
        }

        const hasIntro = Boolean(clean(hub.intro));
        const hasContent = Boolean(clean(hub.content));

        if (!force && (hasIntro || hasContent)) {
          skipped += 1;
          console.log(`- skip ${documentId}${rowLocale ? `/${rowLocale}` : ""} (already has intro/content)`);
          continue;
        }

        const hero = await fetchSingleComponent(db, { entityId: row.id, ...HERO });
        const curriculum = await fetchSingleComponent(db, { entityId: row.id, ...CURRICULUM });
        const flexible = await fetchSingleComponent(db, { entityId: row.id, ...FLEXIBLE });
        const lateral = await fetchSingleComponent(db, { entityId: row.id, ...LATERAL });

        const subtitle = clean(hero?.subtitle);
        const intro = clean(hero?.intro);
        const content = buildContentFromLegacy({
          curriculum,
          flexible_study: flexible,
          lateral_entry: lateral,
        });

        if (!force && !subtitle && !intro && !content) {
          skipped += 1;
          console.log(`- skip ${documentId}${rowLocale ? `/${rowLocale}` : ""} (no legacy narrative fields)`);
          continue;
        }

        const data = {
          subtitle: subtitle || "",
          intro: intro || "",
          content: content || "",
        };

        if (dryRun) {
          updated += 1;
          console.log(`- dry-run ${documentId}${rowLocale ? `/${rowLocale}` : ""}`);
          continue;
        }

        await strapi.documents(UID_HUB).update({
          documentId,
          ...(rowLocale ? { locale: rowLocale } : {}),
          data,
        });

        updated += 1;
        console.log(`- updated ${documentId}${rowLocale ? `/${rowLocale}` : ""}`);
      } catch (e) {
        failed += 1;
        console.error(`- failed ${documentId}${rowLocale ? `/${rowLocale}` : ""}: ${e.message}`);
      }
    }
  }

  await strapi.destroy();

  console.log("\nSummary");
  console.log(`  inspected: ${inspected}`);
  console.log(`  updated:   ${updated}`);
  console.log(`  skipped:   ${skipped}`);
  console.log(`  failed:    ${failed}`);

  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

