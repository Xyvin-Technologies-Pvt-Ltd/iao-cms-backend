/**
 * seed-programme-lecturers-page-omt-cairo.mjs
 *
 * Idempotent seed for EN published entry slug=omt-cairo on
 * api::programme-lecturers-page.programme-lecturers-page.
 *
 * ---------------------------------------------------------------------------
 * REST (Strapi 5) — frontend query
 * ---------------------------------------------------------------------------
 * GET /api/programme-lecturers-pages?filters[slug][$eq]=omt-cairo&locale=en&status=published&populate[hero_image]=true&populate[lecturers][populate][0]=photo&populate[programme]=true&populate[seo]=true
 *
 * Optional deep programme campus populate:
 *   &populate[programme][populate]=programme
 *
 * Returns 0 or 1 row per locale (slug is not localized).
 *
 * ---------------------------------------------------------------------------
 * Localizations (nl/fr/de)
 * ---------------------------------------------------------------------------
 * Not created by this script. After EN exists, add locales in Admin or copy
 * from scripts/strapi-exports when available:
 *   strapi.documents(UID).update({ documentId, locale: 'nl', data: { ... } })
 *   strapi.documents(UID).publish({ documentId, locale: 'nl' })
 *
 * ---------------------------------------------------------------------------
 * Images
 * ---------------------------------------------------------------------------
 * Resolves hero/lecturer photos from Strapi Media (files table) by basename,
 * or uploads from STRAPI_SEED_IMAGES_DIR / frontend programmes folder when set.
 *
 *   node scripts/seed-programme-lecturers-page-omt-cairo.mjs --dry-run
 *   node scripts/seed-programme-lecturers-page-omt-cairo.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createStrapi } = require('@strapi/strapi');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UID = 'api::programme-lecturers-page.programme-lecturers-page';
const CAMPUS_UID = 'api::programme-campus.programme-campus';
const SLUG = 'omt-cairo';
const LOCALE = 'en';

const LECTURER_ROWS = [
  {
    name: 'Dr. Ahmed Hassan',
    role: 'Lead Lecturer OMT',
    professional_title: 'DO, MSc Ost',
    photoBasename: 'lecturer-placeholder.webp',
  },
  {
    name: 'Dr. Sara El-Masry',
    role: 'Senior Lecturer',
    professional_title: 'MSc PT, OMT',
    photoBasename: 'lecturer-placeholder.webp',
  },
  {
    name: 'Dr. Karim Nabil',
    role: 'Lecturer',
    professional_title: 'DO',
    photoBasename: 'lecturer-placeholder.webp',
  },
  {
    name: 'Dr. Layla Farouk',
    role: 'Lecturer',
    professional_title: 'MSc Ost',
    photoBasename: 'lecturer-placeholder.webp',
  },
];

const PAGE = {
  slug: SLUG,
  title: 'Department OMT Cairo',
  breadcrumb_label: 'OMT Cairo Lecturers',
  seo: {
    meta_title: 'OMT Cairo Lecturers | IAO',
    meta_description:
      'Meet the lecturers of the OMT programme at IAO Cairo campus.',
  },
};

const HERO_BASENAMES = [
  'omt-cairo-lecturers-hero.webp',
  'omt-cairo.webp',
  'cairo.webp',
  'group-photo.webp',
  'lecturer-placeholder.webp',
];

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

function argvFlag(name) {
  return process.argv.includes(name);
}

function defaultImagesDir() {
  if (process.env.STRAPI_SEED_IMAGES_DIR) {
    return path.resolve(process.env.STRAPI_SEED_IMAGES_DIR);
  }
  return path.resolve(
    __dirname,
    '../../../IAO-Website-Frontend/iao-landing-website/public/images/programmes'
  );
}

async function findMediaIdByBasename(knex, basename, warnings) {
  if (!basename) return null;
  try {
    const hit = await knex('files')
      .whereILike('url', `%${basename.replace(/%/g, '\\%')}%`)
      .orderBy('id', 'asc')
      .first();
    if (hit?.id) return hit.id;
  } catch (e) {
    warnings.push(`files query failed for ${basename}: ${e.message}`);
  }
  warnings.push(`no Media match for basename=${basename}`);
  return null;
}

async function uploadImageFromDisk(strapi, filePath, fileName) {
  if (!fs.existsSync(filePath)) return null;

  const uploadService = strapi.plugin('upload').service('upload');
  const stat = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);

  const uploaded = await uploadService.upload({
    data: {
      fileInfo: {
        name: fileName,
        alternativeText: fileName,
      },
    },
    files: {
      path: filePath,
      name: fileName,
      type: 'image/webp',
      size: stat.size,
      buffer,
    },
  });

  const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
  return file?.id ?? null;
}

async function resolveOrUploadMedia(strapi, knex, basename, imagesDir, warnings) {
  const fromLib = await findMediaIdByBasename(knex, basename, []);
  if (fromLib) return fromLib;

  const localPath = path.join(imagesDir, basename);
  if (!fs.existsSync(localPath)) {
    warnings.push(`missing local file: ${localPath}`);
    return null;
  }

  return uploadImageFromDisk(strapi, localPath, basename);
}

async function findAnyImageId(knex) {
  const hit = await knex('files').where('mime', 'like', 'image%').orderBy('id', 'asc').first();
  return hit?.id ?? null;
}

async function resolveHeroImageId(strapi, knex, imagesDir, warnings) {
  for (const base of HERO_BASENAMES) {
    const id = await resolveOrUploadMedia(strapi, knex, base, imagesDir, warnings);
    if (id) return id;
  }
  const fallback = await findAnyImageId(knex);
  if (fallback) {
    warnings.push('hero_image: using first image in Media Library as fallback');
    return fallback;
  }
  return null;
}

async function buildLecturersPayload(strapi, knex, imagesDir, warnings) {
  const rows = [];
  let photoId = null;

  for (const base of ['lecturer-placeholder.webp', 'placeholder.webp', 'default.webp']) {
    photoId = await resolveOrUploadMedia(strapi, knex, base, imagesDir, []);
    if (photoId) break;
  }
  if (!photoId) {
    photoId = await findAnyImageId(knex);
    if (photoId) warnings.push('lecturer photos: using shared fallback Media id');
  }

  for (const row of LECTURER_ROWS) {
    let rowPhotoId = photoId;
    if (row.photoBasename) {
      const specific = await resolveOrUploadMedia(
        strapi,
        knex,
        row.photoBasename,
        imagesDir,
        []
      );
      if (specific) rowPhotoId = specific;
    }
    const entry = {
      name: row.name,
      role: row.role,
      professional_title: row.professional_title,
    };
    if (rowPhotoId != null) entry.photo = rowPhotoId;
    rows.push(entry);
  }

  return rows;
}

async function findLinkedCampusDocumentId(knex) {
  const hints = ['%cairo%', '%omt-cairo%', '%omt_cairo%', '%egypt%'];
  for (const pattern of hints) {
    const row = await knex('programme_campuses')
      .select('document_id')
      .where('locale', LOCALE)
      .where(function () {
        this.whereILike('slug', pattern).orWhereILike('campus_slug', pattern);
      })
      .whereNotNull('document_id')
      .first();
    if (row?.document_id) return row.document_id;
  }
  return null;
}

async function main() {
  loadEnvFile('.env');
  const isDryRun = argvFlag('--dry-run');
  const imagesDir = defaultImagesDir();

  console.log(
    `\nSeed programme-lecturers-page / ${SLUG} (${isDryRun ? 'DRY RUN' : 'APPLY'})\n`
  );
  console.log(`Images dir: ${imagesDir} (exists=${fs.existsSync(imagesDir)})\n`);

  const strapi = await createStrapi();
  await strapi.load();
  const knex = strapi.db.connection;
  const warnings = [];

  const existing = await strapi.documents(UID).findMany({
    locale: LOCALE,
    filters: { slug: { $eq: SLUG } },
    status: 'published',
    limit: 1,
  });

  if (existing?.length > 0) {
    console.log(
      `Skip: published ${LOCALE} entry with slug=${SLUG} already exists (documentId=${existing[0].documentId}).`
    );
    await strapi.destroy();
    return;
  }

  const hero_image = await resolveHeroImageId(strapi, knex, imagesDir, warnings);
  const lecturers = await buildLecturersPayload(strapi, knex, imagesDir, warnings);
  const programmeDocumentId = await findLinkedCampusDocumentId(knex);

  const data = {
    ...PAGE,
    lecturers,
  };
  if (hero_image != null) data.hero_image = hero_image;
  if (programmeDocumentId) {
    data.programme = programmeDocumentId;
    console.log(`Link programme-campus documentId=${programmeDocumentId}`);
  } else {
    console.log('No matching programme-campus found; programme relation left empty.');
  }

  if (warnings.length) {
    for (const w of warnings) console.warn(`WARN: ${w}`);
  }

  console.log(`Prepared ${lecturers.length} lecturer row(s), hero_image=${hero_image ?? 'none'}`);

  if (isDryRun) {
    console.log('\nDry-run payload (media ids only):');
    console.log(JSON.stringify(data, null, 2));
    await strapi.destroy();
    return;
  }

  const created = await strapi.documents(UID).create({
    locale: LOCALE,
    data,
  });

  await strapi.documents(UID).publish({
    documentId: created.documentId,
    locale: LOCALE,
  });

  console.log(`\nCreated and published documentId=${created.documentId} locale=${LOCALE}\n`);
  await strapi.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
