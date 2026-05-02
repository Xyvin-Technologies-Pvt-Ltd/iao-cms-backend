/**
 * update-strapi-schema.mjs
 *
 * Updates the strapi_database_schema table so Strapi v5 recognises
 * all new tables on next startup without attempting to re-migrate.
 *
 * Run after all content/component tables are created:
 *   node scripts/update-strapi-schema.mjs
 */

import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db.yqajmnsvvhyacorrurrk.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'base!vb3454',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

// Fetch current schema
const { rows } = await client.query('SELECT * FROM strapi_database_schema LIMIT 1');
if (!rows.length) {
  console.error('strapi_database_schema is empty — run Strapi once first.');
  await client.end();
  process.exit(1);
}

const schemaRaw = typeof rows[0].schema === 'string' ? rows[0].schema : JSON.stringify(rows[0].schema);
const schema = JSON.parse(schemaRaw);

// All new tables that need to be registered
const newTables = [
  'accessibility_pages',
  'associated_clinics_pages',
  'complaints_pages',
  'cookies_pages',
  'csr_pages',
  'csr_pages_cmps',
  'disclaimer_pages',
  'ebook_pages',
  'free_trial_pages',
  'impressum_pages',
  'legal_notice_pages',
  'newsletter_pages',
  'open_days_pages',
  'privacy_pages',
  'terms_pages',
  // Component tables
  'components_shared_page_sections',
  'components_shared_list_items',
  'components_shared_clinic_faq_items',
  'components_events_event_items',
  'components_events_event_sections',
  'components_csr_csr_sections',
  'components_legal_article_sections',
  // Join tables
  'cookies_pages_components',
  'privacy_pages_components',
  'disclaimer_pages_components',
  'terms_pages_components',
  'legal_notice_pages_components',
  'impressum_pages_components',
  'accessibility_pages_components',
  'csr_pages_components',
  'components_csr_csr_sections_components',
  'associated_clinics_pages_components',
  'open_days_pages_components',
  'free_trial_pages_components',
  'components_events_event_sections_components',
];

if (!schema.tables) schema.tables = [];
const existing = new Set(schema.tables.map((t) => (typeof t === 'string' ? t : t.name)));

for (const t of newTables) {
  if (!existing.has(t)) {
    schema.tables.push(t);
    console.log(`  + registered: ${t}`);
  } else {
    console.log(`  – already registered: ${t}`);
  }
}

await client.query('UPDATE strapi_database_schema SET schema = $1 WHERE id = $2', [
  JSON.stringify(schema),
  rows[0].id,
]);

await client.end();
console.log('\nstrapi_database_schema updated.');
