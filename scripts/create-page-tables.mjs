/**
 * create-page-tables.mjs
 *
 * Creates the 14 new page tables in PostgreSQL if they don't exist yet.
 * This replicates what Strapi's ORM would create automatically.
 * Run after Strapi has recognized the new schemas.
 *
 *   node scripts/create-page-tables.mjs
 */

import pg from "pg";

const client = new pg.Client({
  host: "db.yqajmnsvvhyacorrurrk.supabase.co",
  port: 5432,
  user: "postgres",
  password: "base!vb3454",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("✓ Connected to PostgreSQL\n");

// Helper to create a table if it doesn't exist
async function createTable(sql) {
  try {
    await client.query(sql);
    const match = sql.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/);
    if (match) console.log(`  ✅ Table '${match[1]}' ready`);
  } catch (e) {
    console.error(`  ❌ Error:`, e.message);
  }
}

// Base columns shared by all i18n single types
const baseColumns = `
  "id" SERIAL PRIMARY KEY,
  "document_id" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE,
  "published_at" TIMESTAMP WITH TIME ZONE,
  "created_by_id" INTEGER,
  "updated_by_id" INTEGER,
  "locale" VARCHAR(255)
`;

console.log("Creating page tables...\n");

await createTable(`
  CREATE TABLE IF NOT EXISTS "accessibility_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "content" TEXT
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "associated_clinics_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "intro" TEXT,
    "view_list" VARCHAR(255),
    "list_url" VARCHAR(255),
    "why_choose_title" VARCHAR(255),
    "why_choose_items" JSONB,
    "faq_section_title" VARCHAR(255),
    "accordion_items" JSONB
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "cookies_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "sections" JSONB
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "complaints_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "breadcrumb" VARCHAR(255),
    "message_label" VARCHAR(255)
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "csr_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "intro" TEXT,
    "sustainability_title" VARCHAR(255),
    "sustainability_items" JSONB,
    "social_title" VARCHAR(255),
    "social_items" JSONB,
    "governance_title" VARCHAR(255),
    "governance_items" JSONB,
    "scope" TEXT
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "disclaimer_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "intro" TEXT,
    "last_updated" VARCHAR(255),
    "sections" JSONB
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "ebook_pages" (
    ${baseColumns},
    "breadcrumb_ebook" VARCHAR(255),
    "breadcrumb_thank_you" VARCHAR(255),
    "meta_title_form" VARCHAR(255),
    "meta_title_thank_you" VARCHAR(255),
    "meta_description_form" TEXT,
    "meta_description_thank_you" TEXT,
    "title_form" VARCHAR(255),
    "intro_form" VARCHAR(255),
    "title_thank_you" VARCHAR(255),
    "thank_you_message" TEXT,
    "brevo_form_url" VARCHAR(255)
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "free_trial_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "breadcrumb" VARCHAR(255),
    "subtitle" TEXT,
    "subtitle_highlight" VARCHAR(255),
    "subtitle_after" VARCHAR(255),
    "intros" JSONB,
    "event_sections" JSONB
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "legal_notice_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "intro" TEXT,
    "items" JSONB
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "impressum_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "sections" JSONB
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "newsletter_pages" (
    ${baseColumns},
    "breadcrumb" VARCHAR(255),
    "title" VARCHAR(255),
    "description" TEXT,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "email" VARCHAR(255),
    "consent_before" VARCHAR(255),
    "consent_link_text" VARCHAR(255),
    "consent_after" VARCHAR(255),
    "submit" VARCHAR(255),
    "form_submitting" VARCHAR(255),
    "form_success" VARCHAR(255),
    "form_error" TEXT,
    "form_validation" TEXT
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "open_days_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "subtitle" TEXT,
    "event_sections" JSONB
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "privacy_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "last_updated" VARCHAR(255),
    "intro" TEXT,
    "sections" JSONB
  )
`);

await createTable(`
  CREATE TABLE IF NOT EXISTS "terms_pages" (
    ${baseColumns},
    "title" VARCHAR(255),
    "approval" TEXT,
    "copyright_notice" TEXT,
    "contact_label" VARCHAR(255),
    "contact_address" VARCHAR(255),
    "contact_mail" VARCHAR(255),
    "contact_web" VARCHAR(255),
    "contact_tel" VARCHAR(255),
    "articles" JSONB,
    "copyright" VARCHAR(255)
  )
`);

console.log("\n✅ All tables created!\n");

// Verify
const check = await client.query(
  `SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'accessibility_pages','associated_clinics_pages','cookies_pages','complaints_pages',
     'csr_pages','disclaimer_pages','ebook_pages','free_trial_pages','legal_notice_pages',
     'impressum_pages','newsletter_pages','open_days_pages','privacy_pages','terms_pages'
   )
   ORDER BY table_name`
);
console.log(`Verified: ${check.rows.length}/14 tables exist in DB.`);

await client.end();
