import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createStrapi } from "@strapi/strapi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAM_UID = "api::pam-module.pam-module";

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

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
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
    return value;
  }
}

function cleanText(value) {
  if (value == null) return "";
  const text = String(value).trim();
  return text;
}

function pushIfText(list, value) {
  const text = cleanText(value);
  if (text) list.push(text);
}

function dedupeBadgeLabels(labels) {
  const seen = new Set();
  const output = [];
  for (const raw of labels) {
    const label = cleanText(raw);
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({ label });
  }
  return output;
}

function normalizeBadges(oldBadgesValue, oldBadgeSingle) {
  const parsed = parseMaybeJson(oldBadgesValue);
  const values = [];

  for (const item of asArray(parsed)) {
    if (typeof item === "string") {
      values.push(item);
      continue;
    }
    if (typeof item === "object" && item) {
      values.push(item.label ?? item.text ?? item.value ?? "");
    }
  }

  if (typeof parsed === "string") values.push(parsed);
  if (typeof oldBadgeSingle === "string") values.push(oldBadgeSingle);

  return dedupeBadgeLabels(values);
}

function normalizeSchedule(rawSchedule, rawPostScheduleBlocks) {
  const source = parseMaybeJson(rawSchedule) ?? parseMaybeJson(rawPostScheduleBlocks);
  const schedule = [];

  for (const day of asArray(source)) {
    if (!day) continue;
    if (typeof day === "string") {
      schedule.push({ day_title: cleanText(day), items: [] });
      continue;
    }

    const d = asObject(day);
    const dayTitle = cleanText(d.day_title ?? d.dayTitle ?? d.title ?? d.day ?? d.label);
    const itemsSource = d.items ?? d.rows ?? d.activities ?? d.schedule ?? d.entries ?? [];
    const items = [];

    for (const row of asArray(itemsSource)) {
      if (typeof row === "string") {
        const activity = cleanText(row);
        if (activity) items.push({ time: "", activity });
        continue;
      }

      const r = asObject(row);
      const time = cleanText(r.time ?? r.hour ?? r.slot ?? r.from ?? "");
      const activity = cleanText(r.activity ?? r.text ?? r.value ?? r.title ?? r.label ?? "");
      if (time || activity) items.push({ time, activity });
    }

    if (dayTitle || items.length > 0) {
      schedule.push({ day_title: dayTitle, items });
    }
  }

  return schedule;
}

function normalizePracticalRows(rawPracticalRows) {
  const parsed = parseMaybeJson(rawPracticalRows);
  const rows = [];

  for (const row of asArray(parsed)) {
    if (typeof row === "string") {
      const value = cleanText(row);
      if (value) rows.push({ label: "", value, note: "" });
      continue;
    }

    const r = asObject(row);
    const label = cleanText(r.label ?? r.key ?? r.title ?? "");
    const value = cleanText(r.value ?? r.text ?? r.content ?? "");
    const note = cleanText(r.note ?? r.subtext ?? "");
    if (label || value || note) rows.push({ label, value, note });
  }

  return rows;
}

function normalizeLecturers(rawLecturers) {
  const parsed = parseMaybeJson(rawLecturers);
  const cards = [];

  for (const item of asArray(parsed)) {
    if (typeof item === "string") {
      const name = cleanText(item);
      if (name) cards.push({ name, role: "", description: "" });
      continue;
    }

    const l = asObject(item);
    const name = cleanText(l.name ?? l.full_name ?? l.title ?? "");
    const role = cleanText(l.role ?? l.position ?? l.subtitle ?? "");
    const description = cleanText(l.description ?? l.bio ?? l.content ?? "");
    const image = l.image && typeof l.image === "number" ? l.image : undefined;

    if (name || role || description || image) {
      cards.push({
        name,
        role,
        description,
        ...(image ? { image } : {}),
      });
    }
  }

  return cards;
}

function normalizeLocation(rawLocationData, rawLocation) {
  const parsed = parseMaybeJson(rawLocationData);
  const obj = asObject(parsed);

  const location = {
    label: cleanText(obj.label ?? obj.title ?? obj.name ?? rawLocation ?? ""),
    campus: cleanText(obj.campus ?? obj.city ?? ""),
    address: cleanText(obj.address ?? obj.location ?? ""),
    map_embed: cleanText(obj.map_embed ?? obj.mapEmbed ?? obj.embed ?? obj.map ?? ""),
    search_link: cleanText(obj.search_link ?? obj.searchLink ?? obj.link ?? ""),
  };

  const hasAny = Object.values(location).some((value) => value);
  return hasAny ? location : null;
}

function normalizeContent(rawContentBlocks, existingContent) {
  const currentContent = cleanText(existingContent);
  if (currentContent) return currentContent;

  const parsed = parseMaybeJson(rawContentBlocks);
  const parts = [];

  for (const block of asArray(parsed)) {
    if (typeof block === "string") {
      pushIfText(parts, block);
      continue;
    }

    const b = asObject(block);
    pushIfText(parts, b.title);
    pushIfText(parts, b.subtitle);
    pushIfText(parts, b.paragraph);
    pushIfText(parts, b.text);
    pushIfText(parts, b.content);
    pushIfText(parts, b.body);
    pushIfText(parts, b.value);
  }

  return parts.join("\n\n").trim();
}

function stableStringify(value) {
  return JSON.stringify(value, Object.keys(value || {}).sort());
}

function deepEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}

async function main() {
  loadEnvFile(".env");

  const isDryRun = process.argv.includes("--dry-run");
  const isForce = process.argv.includes("--force");

  console.log(`\nPAM JSON -> components migration (${isDryRun ? "DRY RUN" : "APPLY"})`);

  const strapi = await createStrapi();
  await strapi.load();

  const rows = await strapi.db.connection("pam_modules").select("*").orderBy("id", "asc");
  console.log(`Found ${rows.length} pam_modules row(s)`);

  let inspected = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    inspected += 1;
    const documentId = row.document_id;
    const locale = row.locale || "en";

    if (!documentId) {
      skipped += 1;
      console.log(`- skip row id=${row.id} (missing document_id)`);
      continue;
    }

    try {
      const existing = await strapi.documents(PAM_UID).findOne({
        documentId,
        locale,
        populate: ["schedule", "practical_rows", "lecturers", "location_info", "badges"],
      });

      if (!existing) {
        skipped += 1;
        console.log(`- skip ${documentId}/${locale} (document not found)`);
        continue;
      }

      const nextData = {
        schedule: normalizeSchedule(row.schedule, row.post_schedule_blocks),
        practical_rows: normalizePracticalRows(row.practical_rows),
        lecturers: normalizeLecturers(row.lecturers),
        location_info: normalizeLocation(row.location_data, row.location),
        badges: normalizeBadges(row.badges, row.badge),
      };

      const mergedContent = normalizeContent(row.content_blocks, existing.content);
      if (mergedContent) nextData.content = mergedContent;

      const currentComparable = {
        schedule: existing.schedule ?? [],
        practical_rows: existing.practical_rows ?? [],
        lecturers: (existing.lecturers ?? []).map((item) => ({
          name: item.name ?? "",
          role: item.role ?? "",
          description: item.description ?? "",
          ...(item.image?.id ? { image: item.image.id } : {}),
        })),
        location_info: existing.location_info
          ? {
              label: existing.location_info.label ?? "",
              campus: existing.location_info.campus ?? "",
              address: existing.location_info.address ?? "",
              map_embed: existing.location_info.map_embed ?? "",
              search_link: existing.location_info.search_link ?? "",
            }
          : null,
        badges: (existing.badges ?? []).map((item) => ({ label: item.label ?? "" })),
        ...(existing.content ? { content: existing.content } : {}),
      };

      const nextComparable = {
        ...nextData,
      };

      const hasLegacyInput =
        row.schedule != null ||
        row.post_schedule_blocks != null ||
        row.practical_rows != null ||
        row.lecturers != null ||
        row.location_data != null ||
        row.location != null ||
        row.badges != null ||
        row.badge != null ||
        row.content_blocks != null;

      if (!hasLegacyInput && !isForce) {
        skipped += 1;
        console.log(`- skip ${documentId}/${locale} (no legacy source values)`);
        continue;
      }

      if (!isForce && deepEqual(currentComparable, nextComparable)) {
        skipped += 1;
        console.log(`- skip ${documentId}/${locale} (already migrated)`);
        continue;
      }

      if (isDryRun) {
        updated += 1;
        console.log(`- dry-run ${documentId}/${locale}`);
        continue;
      }

      await strapi.documents(PAM_UID).update({
        documentId,
        locale,
        data: nextData,
      });

      updated += 1;
      console.log(`- updated ${documentId}/${locale}`);
    } catch (error) {
      failed += 1;
      console.error(`- failed ${documentId}/${locale}: ${error.message}`);
    }
  }

  await strapi.destroy();

  console.log("\nMigration summary");
  console.log(`  inspected: ${inspected}`);
  console.log(`  updated:   ${updated}`);
  console.log(`  skipped:   ${skipped}`);
  console.log(`  failed:    ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
