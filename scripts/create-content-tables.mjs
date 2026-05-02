/**
 * create-content-tables.mjs
 *
 * Creates all 14 content type tables with the REFACTORED schema structure
 * (no JSON columns — those are now handled by component join tables).
 *
 * Run once:
 *   node scripts/create-content-tables.mjs
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

const COMMON = `
  id              SERIAL PRIMARY KEY,
  document_id     VARCHAR(255),
  locale          VARCHAR(255) DEFAULT 'en',
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by_id   INTEGER,
  updated_by_id   INTEGER
`;

const tables = [
  // ── Legal / policy pages (sections handled by join tables) ─────────────────
  {
    name: 'accessibility_pages',
    extra: `
      title        VARCHAR(255) NOT NULL,
      intro        JSONB
    `,
  },
  {
    name: 'cookies_pages',
    extra: `
      title        VARCHAR(255) NOT NULL,
      intro        JSONB
    `,
  },
  {
    name: 'disclaimer_pages',
    extra: `
      title        VARCHAR(255) NOT NULL,
      last_updated VARCHAR(255),
      intro        JSONB
    `,
  },
  {
    name: 'privacy_pages',
    extra: `
      title        VARCHAR(255) NOT NULL,
      last_updated VARCHAR(255),
      intro        JSONB
    `,
  },
  {
    name: 'terms_pages',
    extra: `
      title            VARCHAR(255) NOT NULL,
      last_updated     VARCHAR(255),
      intro            JSONB,
      copyright        VARCHAR(255),
      contact_label    VARCHAR(255),
      contact_address  VARCHAR(255),
      contact_email    VARCHAR(255),
      contact_website  VARCHAR(255),
      contact_phone    VARCHAR(255)
    `,
  },
  {
    name: 'legal_notice_pages',
    extra: `
      title        VARCHAR(255) NOT NULL,
      intro        JSONB
    `,
  },
  {
    name: 'impressum_pages',
    extra: `
      title  VARCHAR(255) NOT NULL
    `,
  },

  // ── CSR ───────────────────────────────────────────────────────────────────
  {
    name: 'csr_pages',
    extra: `
      title  VARCHAR(255) NOT NULL,
      intro  JSONB,
      scope  JSONB
    `,
  },

  // ── Associated Clinics ────────────────────────────────────────────────────
  {
    name: 'associated_clinics_pages',
    extra: `
      title             VARCHAR(255) NOT NULL,
      intro             JSONB,
      view_list_label   VARCHAR(255),
      list_url          VARCHAR(255),
      why_choose_title  VARCHAR(255),
      faq_section_title VARCHAR(255)
    `,
  },

  // ── Complaints ────────────────────────────────────────────────────────────
  {
    name: 'complaints_pages',
    extra: `
      title         VARCHAR(255) NOT NULL,
      breadcrumb    VARCHAR(255),
      message_label VARCHAR(255)
    `,
  },

  // ── Ebook ─────────────────────────────────────────────────────────────────
  {
    name: 'ebook_pages',
    extra: `
      breadcrumb_ebook          VARCHAR(255),
      breadcrumb_thank_you      VARCHAR(255),
      meta_title_form           VARCHAR(255),
      meta_title_thank_you      VARCHAR(255),
      meta_description_form     TEXT,
      meta_description_thank_you TEXT,
      title_form                VARCHAR(255),
      intro_form                VARCHAR(255),
      title_thank_you           VARCHAR(255),
      thank_you_message         TEXT,
      brevo_form_url            VARCHAR(255)
    `,
  },

  // ── Newsletter ────────────────────────────────────────────────────────────
  {
    name: 'newsletter_pages',
    extra: `
      breadcrumb          VARCHAR(255),
      title               VARCHAR(255) NOT NULL,
      description         TEXT,
      first_name          VARCHAR(255),
      last_name           VARCHAR(255),
      email               VARCHAR(255),
      consent             JSONB,
      submit              VARCHAR(255),
      form_submitting     VARCHAR(255),
      form_success        VARCHAR(255),
      form_error          TEXT,
      form_validation     TEXT
    `,
  },

  // ── Open Days ─────────────────────────────────────────────────────────────
  {
    name: 'open_days_pages',
    extra: `
      title    VARCHAR(255) NOT NULL,
      subtitle JSONB
    `,
  },

  // ── Free Trial ────────────────────────────────────────────────────────────
  {
    name: 'free_trial_pages',
    extra: `
      title      VARCHAR(255) NOT NULL,
      breadcrumb VARCHAR(255),
      intro      JSONB
    `,
  },
];

await client.connect();
console.log('\n=== Creating content type tables ===');
for (const { name, extra } of tables) {
  const cols = `${COMMON}, ${extra}`;
  await run(name, `CREATE TABLE IF NOT EXISTS "${name}" (${cols})`);
}

// Also add the _cmps (Strapi internal components pointer) table for
// single-component fields on csr_pages (sustainability, social, governance)
await run(
  'csr_pages_cmps (single component pointers)',
  `CREATE TABLE IF NOT EXISTS csr_pages_cmps (
    id            SERIAL PRIMARY KEY,
    entity_id     INTEGER NOT NULL,
    cmp_id        INTEGER NOT NULL,
    component_type VARCHAR(255) NOT NULL,
    field          VARCHAR(255),
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
  )`
);

await client.end();
console.log('\nAll content tables created.');
