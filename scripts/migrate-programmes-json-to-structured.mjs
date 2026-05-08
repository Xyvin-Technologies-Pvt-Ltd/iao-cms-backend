import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createStrapi } from "@strapi/strapi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORTS_DIR = path.resolve(__dirname, "strapi-exports");

const UID_OVERVIEW = "api::programmes-overview.programmes-overview";
const UID_HUB = "api::programme-hub.programme-hub";
const UID_CAMPUS = "api::programme-campus.programme-campus";

const PROGRAMME_TYPES = ["master", "lateral", "manual-therapy", "omt-egypt"];

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

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function listFilesRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const out = [];
  const stack = [dirPath];
  while (stack.length) {
    const current = stack.pop();
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, item.name);
      if (item.isDirectory()) {
        stack.push(full);
      } else if (item.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

function normalizeLinks(source) {
  const links = [];
  for (const item of asArray(source)) {
    if (typeof item === "string") {
      const label = clean(item);
      if (label) links.push({ label, segment: "" });
      continue;
    }
    const obj = asObj(item);
    const label = clean(obj.label ?? obj.title ?? obj.text ?? obj.name);
    const segment = clean(obj.segment ?? obj.href ?? obj.slug ?? obj.path);
    if (label || segment) links.push({ label, segment });
  }
  return links;
}

function normalizeHero(source) {
  const hero = asObj(source);
  const out = {
    title: clean(hero.title),
    subtitle: clean(hero.subtitle),
    intro: clean(hero.intro ?? hero.description),
    cta: clean(hero.cta ?? hero.cta_label ?? hero.button_label),
    hide_cta: Boolean(hero.hide_cta ?? hero.hideCta ?? false),
    form_src: clean(hero.form_src ?? hero.formSrc),
  };
  return Object.values(out).some((v) => (typeof v === "boolean" ? v : v)) ? out : null;
}

function normalizeCampusCards(source) {
  const cards = [];
  for (const item of asArray(source)) {
    const obj = asObj(item);
    const card = {
      label: clean(obj.label ?? obj.title),
      href: clean(obj.href ?? obj.link ?? obj.segment),
      alt: clean(obj.alt ?? obj.image_alt),
    };
    if (obj.image && typeof obj.image === "number") card.image = obj.image;
    if (card.label || card.href || card.alt || card.image) cards.push(card);
  }
  return cards;
}

function normalizeCurriculum(source) {
  const cur = asObj(source);
  const items = [];
  for (const item of asArray(cur.items ?? cur.rows ?? cur.list)) {
    const row = asObj(item);
    const title = clean(row.title ?? row.label);
    const description = clean(row.description ?? row.text ?? row.value);
    if (title || description) items.push({ title, description });
  }

  const listStyleRaw = clean(cur.list_style ?? cur.listStyle).toLowerCase();
  const list_style = ["check", "bullet", "number"].includes(listStyleRaw) ? listStyleRaw : "check";

  const out = {
    title: clean(cur.title),
    intro_line: clean(cur.intro_line ?? cur.introLine),
    paragraph: clean(cur.paragraph ?? cur.description),
    paragraph_2: clean(cur.paragraph_2 ?? cur.paragraph2),
    list_style,
    check_color: clean(cur.check_color ?? cur.checkColor),
    items,
  };
  return Object.values(out).some((v) => (Array.isArray(v) ? v.length : v)) ? out : null;
}

function normalizeFlexibleStudy(source) {
  const fsData = asObj(source);
  const out = {
    title: clean(fsData.title),
    description: clean(fsData.description),
    paragraph_1: clean(fsData.paragraph_1 ?? fsData.paragraph1),
    paragraph_2: clean(fsData.paragraph_2 ?? fsData.paragraph2),
  };
  return Object.values(out).some(Boolean) ? out : null;
}

function normalizeLateralEntry(source) {
  const le = asObj(source);
  const out = {
    before: clean(le.before),
    label: clean(le.label),
    href: clean(le.href ?? le.link),
    after: clean(le.after),
    bold: clean(le.bold),
    emphasis: clean(le.emphasis),
  };
  return Object.values(out).some(Boolean) ? out : null;
}

function normalizeOptions(source) {
  const opt = asObj(source);
  const programmeLayoutRaw = clean(opt.programme_layout ?? opt.programmeLayout).toLowerCase();
  const locationLayoutRaw = clean(opt.location_layout ?? opt.locationLayout).toLowerCase();
  const programme_layout = ["linear", "split", "stacked"].includes(programmeLayoutRaw)
    ? programmeLayoutRaw
    : "linear";
  const location_layout = ["grid", "list"].includes(locationLayoutRaw) ? locationLayoutRaw : "grid";

  return {
    hide_hero_cta: Boolean(opt.hide_hero_cta ?? opt.hideHeroCta ?? false),
    hide_modules_section: Boolean(opt.hide_modules_section ?? opt.hideModulesSection ?? false),
    breadcrumb_hide_final: Boolean(opt.breadcrumb_hide_final ?? opt.breadcrumbHideFinal ?? false),
    programme_layout,
    location_layout,
  };
}

function normalizeTrackItems(source) {
  const rows = [];
  for (const item of asArray(source)) {
    const obj = asObj(item);
    const title = clean(obj.title ?? obj.label);
    const schedule = clean(obj.schedule ?? obj.date ?? obj.time ?? obj.value);
    if (title || schedule) rows.push({ title, schedule });
  }
  return rows;
}

function normalizeTrackGroups(source) {
  const groups = [];
  for (const item of asArray(source)) {
    const obj = asObj(item);
    const group = {
      track_title: clean(obj.track_title ?? obj.trackTitle ?? obj.title),
      year_1_title: clean(obj.year_1_title ?? obj.year1Title ?? obj.year_1),
      year_2_title: clean(obj.year_2_title ?? obj.year2Title ?? obj.year_2),
      year_1_items: normalizeTrackItems(obj.year_1_items ?? obj.year1Items ?? obj.year_1_rows),
      year_2_items: normalizeTrackItems(obj.year_2_items ?? obj.year2Items ?? obj.year_2_rows),
    };
    if (
      group.track_title ||
      group.year_1_title ||
      group.year_2_title ||
      group.year_1_items.length ||
      group.year_2_items.length
    ) {
      groups.push(group);
    }
  }
  return groups;
}

function normalizeLecturersSection(source) {
  const obj = asObj(source);
  const out = {
    text: clean(obj.text ?? obj.intro ?? obj.description),
    link_before: clean(obj.link_before ?? obj.linkBefore),
    link_label: clean(obj.link_label ?? obj.linkLabel ?? obj.label),
    link_after: clean(obj.link_after ?? obj.linkAfter),
  };
  return Object.values(out).some(Boolean) ? out : null;
}

function normalizePracticalItems(source) {
  const items = [];
  for (const item of asArray(source)) {
    const obj = asObj(item);
    const row = {
      label: clean(obj.label ?? obj.title),
      value: clean(obj.value ?? obj.text ?? obj.description),
      note: clean(obj.note ?? obj.subtext),
    };
    if (row.label || row.value || row.note) items.push(row);
  }
  return items;
}

function normalizeLocation(source) {
  const obj = asObj(source);
  const out = {
    label: clean(obj.label ?? obj.title),
    campus: clean(obj.campus ?? obj.city),
    address: clean(obj.address ?? obj.location),
    map_embed: clean(obj.map_embed ?? obj.mapEmbed ?? obj.map),
    search_link: clean(obj.search_link ?? obj.searchLink ?? obj.link),
  };
  return Object.values(out).some(Boolean) ? out : null;
}

function normalizeOverviewContent(contentObj) {
  const c = asObj(contentObj);
  return {
    title: clean(c.title),
    lifelong_title: clean(c.lifelong_title ?? c.lifelongTitle),
    lifelong_intro: clean(c.lifelong_intro ?? c.lifelongIntro),
    lifelong_links: normalizeLinks(c.lifelong_links ?? c.lifelongLinks),
    orientation_title: clean(c.orientation_title ?? c.orientationTitle),
    orientation_intro: clean(c.orientation_intro ?? c.orientationIntro),
    orientation_links: normalizeLinks(c.orientation_links ?? c.orientationLinks),
  };
}

function normalizeHubContent(contentObj) {
  const c = asObj(contentObj);
  return {
    title: clean(c.title),
    hero: normalizeHero(c.hero),
    campus_cards: normalizeCampusCards(c.campus_cards ?? c.campusCards),
    curriculum: normalizeCurriculum(c.curriculum),
    flexible_study: normalizeFlexibleStudy(c.flexible_study ?? c.flexibleStudy),
    lateral_entry: normalizeLateralEntry(c.lateral_entry ?? c.lateralEntry),
    options: normalizeOptions(c.options),
    breadcrumb_label: clean(c.breadcrumb_label ?? c.breadcrumbLabel),
    modules_title: clean(c.modules_title ?? c.modulesTitle),
  };
}

function normalizeCampusOverrides(overridesObj) {
  const c = asObj(overridesObj);
  const introFromParts = [c.paragraph_1, c.paragraph_2, c.paragraph_3].map(clean).filter(Boolean).join("\n\n");
  return {
    hero: normalizeHero(c.hero),
    content_intro: clean(c.content_intro ?? c.contentIntro ?? introFromParts),
    track_groups: normalizeTrackGroups(c.track_groups ?? c.trackGroups ?? c.tracks),
    lecturers_section: normalizeLecturersSection(c.lecturers_section ?? c.lecturersSection ?? c.lecturers),
    practical_items: normalizePracticalItems(c.practical_items ?? c.practicalItems ?? c.practical_rows),
    location_info: normalizeLocation(c.location_info ?? c.locationData ?? c.location),
    options: normalizeOptions(c.options),
    breadcrumb_label: clean(c.breadcrumb_label ?? c.breadcrumbLabel),
    modules_title: clean(c.modules_title ?? c.modulesTitle),
  };
}

function hasStructuredOverview(entry) {
  return Boolean(entry?.lifelong_title || entry?.orientation_title || (entry?.lifelong_links || []).length);
}

function hasStructuredCampus(entry) {
  return Boolean(entry?.content_intro || (entry?.track_groups || []).length || entry?.hero);
}

function hasStructuredHub(entry) {
  return Boolean(entry?.title || entry?.hero || (entry?.campus_cards || []).length);
}

function getLegacyHubTableName(programmeType) {
  if (programmeType === "manual-therapy") return "programme_manual_therapy";
  if (programmeType === "master") return "programme_master";
  if (programmeType === "lateral") return "programme_lateral";
  return null;
}

function collectExportPayloads() {
  const result = {
    overview: [],
    hubs: [],
    campuses: [],
  };
  if (!fs.existsSync(EXPORTS_DIR)) return result;

  const files = listFilesRecursive(EXPORTS_DIR).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const lower = file.toLowerCase();
    const parsed = safeReadJson(file);
    if (!parsed) continue;

    if (lower.includes("programmes-overview")) result.overview.push(...asArray(parsed));
    if (
      lower.includes("programme-hub") ||
      lower.includes("programme-master") ||
      lower.includes("programme-lateral") ||
      lower.includes("programme-manual")
    ) {
      result.hubs.push(...asArray(parsed));
    }
    if (lower.includes("programme-campus")) result.campuses.push(...asArray(parsed));
  }
  return result;
}

async function upsertProgrammeHub(strapi, programmeType, locale, legacyContent, options) {
  const { dryRun, force } = options;
  const existingList = await strapi.documents(UID_HUB).findMany({
    locale,
    filters: { programme_type: { $eq: programmeType } },
    populate: ["hero", "campus_cards", "curriculum", "flexible_study", "lateral_entry", "options"],
  });
  const existing = Array.isArray(existingList) ? existingList[0] : null;

  const normalized = normalizeHubContent(legacyContent);
  if (!normalized.title) normalized.title = programmeType;

  if (existing && hasStructuredHub(existing) && !force) {
    return { status: "skipped", documentId: existing.documentId, reason: "already structured" };
  }

  if (dryRun) {
    return {
      status: existing ? "would-update" : "would-create",
      documentId: existing?.documentId ?? "(new)",
      reason: `${programmeType}/${locale}`,
    };
  }

  if (existing) {
    await strapi.documents(UID_HUB).update({
      documentId: existing.documentId,
      locale,
      data: { ...normalized, programme_type: programmeType },
    });
    return { status: "updated", documentId: existing.documentId };
  }

  const created = await strapi.documents(UID_HUB).create({
    locale,
    data: {
      programme_type: programmeType,
      slug: programmeType,
      ...normalized,
    },
  });
  return { status: "created", documentId: created.documentId };
}

async function main() {
  loadEnvFile(".env");
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");
  const exportPayloads = collectExportPayloads();

  const strapi = await createStrapi();
  await strapi.load();

  let updated = 0;
  let created = 0;
  let skipped = 0;
  let warnings = 0;

  console.log(`\nProgramme migration (${dryRun ? "DRY RUN" : "APPLY"})`);
  console.log(`Force mode: ${force ? "on" : "off"}`);
  console.log(`Backup exports dir: ${fs.existsSync(EXPORTS_DIR) ? EXPORTS_DIR : "not found (live DB only)"}`);

  // 1) Programmes overview
  const overviewRows = await strapi.db.connection("programmes_overview").select("*");
  for (const row of overviewRows) {
    const locale = row.locale || "en";
    const existing = await strapi.documents(UID_OVERVIEW).findFirst({ locale, populate: ["lifelong_links", "orientation_links"] });
    if (!existing) {
      warnings += 1;
      console.warn(`! overview ${locale}: document not found`);
      continue;
    }
    if (hasStructuredOverview(existing) && !force) {
      skipped += 1;
      console.log(`- overview ${locale}: skipped (already structured)`);
      continue;
    }

    const legacyContent = parseMaybeJson(row.content) ?? exportPayloads.overview.find((x) => x?.locale === locale)?.content;
    const mapped = normalizeOverviewContent(legacyContent);
    if (!mapped.title && existing.title) mapped.title = existing.title;

    if (dryRun) {
      updated += 1;
      console.log(`- overview ${locale}: would-update`);
      continue;
    }

    await strapi.documents(UID_OVERVIEW).update({
      documentId: existing.documentId,
      locale,
      data: mapped,
    });
    updated += 1;
    console.log(`- overview ${locale}: updated`);
  }

  // 2) Programme hubs (from legacy single types)
  const hubByLocaleAndType = new Map();
  for (const programmeType of PROGRAMME_TYPES) {
    const table = getLegacyHubTableName(programmeType);
    if (!table) continue;
    let rows = [];
    try {
      rows = await strapi.db.connection(table).select("*");
    } catch {
      rows = [];
    }

    if (!rows.length) {
      warnings += 1;
      console.warn(`! no legacy rows found in ${table}`);
    }

    for (const row of rows) {
      const locale = row.locale || "en";
      const key = `${programmeType}:${locale}`;
      const legacyContent = parseMaybeJson(row.content);
      hubByLocaleAndType.set(key, legacyContent);
    }
  }

  // fallback from exports if legacy tables are absent
  for (const fallback of exportPayloads.hubs) {
    const locale = fallback.locale || "en";
    const programmeType = fallback.programme_type || fallback.programmeType;
    if (!PROGRAMME_TYPES.includes(programmeType)) continue;
    const key = `${programmeType}:${locale}`;
    if (!hubByLocaleAndType.has(key)) {
      hubByLocaleAndType.set(key, fallback.content ?? fallback);
    }
  }

  for (const key of hubByLocaleAndType.keys()) {
    const [programmeType, locale] = key.split(":");
    const res = await upsertProgrammeHub(strapi, programmeType, locale, hubByLocaleAndType.get(key), {
      dryRun,
      force,
    });
    if (res.status === "updated" || res.status === "would-update") updated += 1;
    else if (res.status === "created" || res.status === "would-create") created += 1;
    else skipped += 1;
    console.log(`- hub ${programmeType}/${locale}: ${res.status}`);
  }

  // 3) Programme campuses
  const campusRows = await strapi.db.connection("programme_campuses").select("*").orderBy("id", "asc");
  for (const row of campusRows) {
    const locale = row.locale || "en";
    const programmeType = row.programme_type;
    const documentId = row.document_id;
    if (!documentId || !programmeType) {
      warnings += 1;
      console.warn(`! campus row id=${row.id}: missing document_id or programme_type`);
      continue;
    }

    const hub = (
      await strapi.documents(UID_HUB).findMany({
        locale,
        filters: { programme_type: { $eq: programmeType } },
      })
    )?.[0];

    if (!hub) {
      warnings += 1;
      console.warn(`! campus ${documentId}/${locale}: no hub for type=${programmeType}`);
      continue;
    }

    const existingCampus = await strapi.documents(UID_CAMPUS).findOne({
      documentId,
      locale,
      populate: ["hero", "track_groups", "lecturers_section", "practical_items", "location_info", "options", "programme"],
    });

    if (!existingCampus) {
      warnings += 1;
      console.warn(`! campus ${documentId}/${locale}: document not found`);
      continue;
    }

    if (hasStructuredCampus(existingCampus) && existingCampus.programme?.documentId && !force) {
      skipped += 1;
      console.log(`- campus ${row.campus_slug}/${locale}: skipped (already structured)`);
      continue;
    }

    const legacyOverrides =
      parseMaybeJson(row.content_overrides) ??
      exportPayloads.campuses.find((x) => (x.document_id || x.documentId) === documentId && (x.locale || "en") === locale)
        ?.content_overrides;
    const mapped = normalizeCampusOverrides(legacyOverrides);

    const nextData = {
      campus_slug: clean(row.campus_slug),
      programme_type: programmeType,
      programme: hub.documentId,
      ...mapped,
    };

    if (dryRun) {
      updated += 1;
      console.log(`- campus ${row.campus_slug}/${locale}: would-update`);
      continue;
    }

    await strapi.documents(UID_CAMPUS).update({
      documentId,
      locale,
      data: nextData,
    });
    updated += 1;
    console.log(`- campus ${row.campus_slug}/${locale}: updated`);
  }

  await strapi.destroy();

  console.log("\nSummary");
  console.log(`  created:  ${created}`);
  console.log(`  updated:  ${updated}`);
  console.log(`  skipped:  ${skipped}`);
  console.log(`  warnings: ${warnings}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
