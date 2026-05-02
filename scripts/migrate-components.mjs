/**
 * migrate-components.mjs
 *
 * Creates the PostgreSQL tables required by the new Strapi components
 * introduced during the JSON → component refactoring:
 *
 *  - shared.page-section      → components_shared_page_sections
 *  - shared.list-item         → components_shared_list_items
 *  - shared.clinic-faq-item   → components_shared_clinic_faq_items
 *  - events.event-item        → components_events_event_items
 *  - events.event-section     → components_events_event_sections
 *  - csr.csr-section          → components_csr_csr_sections
 *  - legal.article-section    → components_legal_article_sections
 *
 * Also creates the Strapi "morphic" component join tables for each
 * parent content type that now uses these repeatable components.
 *
 * Run once after deploying the new schema files:
 *   node scripts/migrate-components.mjs
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

// ---------------------------------------------------------------------------
// Helper: run SQL safely (log error but continue)
// ---------------------------------------------------------------------------
async function run(label, sql) {
  try {
    await client.query(sql);
    console.log(`  ✓ ${label}`);
  } catch (err) {
    if (err.code === '42P07') {
      console.log(`  – ${label} (already exists)`);
    } else {
      console.error(`  ✗ ${label}: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Component data tables
// ---------------------------------------------------------------------------
const componentTables = [
  {
    table: 'components_shared_page_sections',
    cols: `
      id            SERIAL PRIMARY KEY,
      section_title VARCHAR(255),
      body          JSONB,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    `,
  },
  {
    table: 'components_shared_list_items',
    cols: `
      id         SERIAL PRIMARY KEY,
      text       VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    `,
  },
  {
    table: 'components_shared_clinic_faq_items',
    cols: `
      id         SERIAL PRIMARY KEY,
      question   VARCHAR(255) NOT NULL,
      answer     JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    `,
  },
  {
    table: 'components_events_event_items',
    cols: `
      id             SERIAL PRIMARY KEY,
      title          VARCHAR(255) NOT NULL,
      day_label      VARCHAR(255),
      date_short     VARCHAR(255),
      time           VARCHAR(255),
      register_url   VARCHAR(255) NOT NULL,
      register_label VARCHAR(255) NOT NULL,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    `,
  },
  {
    table: 'components_events_event_sections',
    cols: `
      id         SERIAL PRIMARY KEY,
      heading    VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    `,
  },
  {
    table: 'components_csr_csr_sections',
    cols: `
      id         SERIAL PRIMARY KEY,
      title      VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    `,
  },
  {
    table: 'components_legal_article_sections',
    cols: `
      id         SERIAL PRIMARY KEY,
      title      VARCHAR(255) NOT NULL,
      body       JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    `,
  },
];

// ---------------------------------------------------------------------------
// Strapi component morphic join tables
// Each repeatable component on a content type gets one of these.
// Convention: <content_collection>_components
// (Strapi v4/v5 uses a single polymorphic join table per content type)
// ---------------------------------------------------------------------------
const joinTables = [
  // Already exists for about_pages, faq_pages, contact_pages — skip.

  // Legal pages — sections (shared.page-section)
  { table: 'cookies_pages_components' },
  { table: 'privacy_pages_components' },
  { table: 'disclaimer_pages_components' },
  { table: 'terms_pages_components' },
  { table: 'legal_notice_pages_components' },
  { table: 'impressum_pages_components' },
  { table: 'accessibility_pages_components' },

  // CSR — three single components + list items inside csr-section
  { table: 'csr_pages_components' },
  { table: 'components_csr_csr_sections_components' },

  // Associated Clinics — why_choose_items + faq_items
  { table: 'associated_clinics_pages_components' },

  // Open Days + Free Trial — event_sections
  { table: 'open_days_pages_components' },
  { table: 'free_trial_pages_components' },

  // event-section → events (nested repeatable inside event-section)
  { table: 'components_events_event_sections_components' },
];

const JOIN_TABLE_DDL = `
  id                SERIAL PRIMARY KEY,
  entity_id         INTEGER NOT NULL,
  component_id      INTEGER NOT NULL,
  component_type    VARCHAR(255) NOT NULL,
  field             VARCHAR(255),
  "order"           FLOAT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
`;

async function main() {
  await client.connect();
  console.log('\n=== Creating component data tables ===');
  for (const { table, cols } of componentTables) {
    await run(table, `CREATE TABLE IF NOT EXISTS "${table}" (${cols})`);
  }

  console.log('\n=== Creating component join tables ===');
  for (const { table } of joinTables) {
    await run(table, `CREATE TABLE IF NOT EXISTS "${table}" (${JOIN_TABLE_DDL})`);
  }

  await client.end();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
