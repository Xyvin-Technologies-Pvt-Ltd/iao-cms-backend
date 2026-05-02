/**
 * migrate-schema-columns.mjs
 *
 * Alters existing content type tables to match the refactored schemas:
 * - Drop old JSON columns that are now replaced by repeatable components
 * - Add new columns (intro as jsonb for blocks, etc.)
 * - Rename columns where field names changed
 *
 * Run AFTER migrate-components.mjs and after Strapi restarts once.
 *   node scripts/migrate-schema-columns.mjs
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
    const ignorable = ['42P07', '42701', '42703', '42P16'];
    if (ignorable.includes(err.code)) {
      console.log(`  – ${label} (skipped: ${err.message.split('\n')[0]})`);
    } else {
      console.error(`  ✗ ${label}: ${err.message}`);
    }
  }
}

async function main() {
  await client.connect();

  // -------------------------------------------------------------------------
  // cookies_pages: drop sections json → handled by join table; add intro
  // -------------------------------------------------------------------------
  console.log('\n=== cookies_pages ===');
  await run('drop sections json', `ALTER TABLE cookies_pages DROP COLUMN IF EXISTS sections`);
  await run('add intro (blocks)', `ALTER TABLE cookies_pages ADD COLUMN IF NOT EXISTS intro JSONB`);
  await run('drop footer_label / footer_note', `ALTER TABLE cookies_pages DROP COLUMN IF EXISTS footer_label, DROP COLUMN IF EXISTS footer_note`);

  // -------------------------------------------------------------------------
  // privacy_pages
  // -------------------------------------------------------------------------
  console.log('\n=== privacy_pages ===');
  await run('drop sections json', `ALTER TABLE privacy_pages DROP COLUMN IF EXISTS sections`);
  await run('add intro (blocks)', `ALTER TABLE privacy_pages ADD COLUMN IF NOT EXISTS intro JSONB`);
  await run('drop footer_label / footer_note', `ALTER TABLE privacy_pages DROP COLUMN IF EXISTS footer_label, DROP COLUMN IF EXISTS footer_note`);

  // -------------------------------------------------------------------------
  // disclaimer_pages
  // -------------------------------------------------------------------------
  console.log('\n=== disclaimer_pages ===');
  await run('drop sections json', `ALTER TABLE disclaimer_pages DROP COLUMN IF EXISTS sections`);
  await run('convert intro text→jsonb', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='disclaimer_pages' AND column_name='intro' AND data_type='text') THEN
        ALTER TABLE disclaimer_pages ALTER COLUMN intro TYPE JSONB USING intro::JSONB;
      END IF;
    END $$
  `);
  await run('drop footer_label / footer_note', `ALTER TABLE disclaimer_pages DROP COLUMN IF EXISTS footer_label, DROP COLUMN IF EXISTS footer_note`);

  // -------------------------------------------------------------------------
  // terms_pages
  // -------------------------------------------------------------------------
  console.log('\n=== terms_pages ===');
  await run('drop articles json', `ALTER TABLE terms_pages DROP COLUMN IF EXISTS articles`);
  await run('add intro (blocks)', `ALTER TABLE terms_pages ADD COLUMN IF NOT EXISTS intro JSONB`);
  await run('add last_updated', `ALTER TABLE terms_pages ADD COLUMN IF NOT EXISTS last_updated VARCHAR(255)`);
  await run('drop footer_label / footer_note', `ALTER TABLE terms_pages DROP COLUMN IF EXISTS footer_label, DROP COLUMN IF EXISTS footer_note`);
  await run('rename contact_mail → contact_email', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='terms_pages' AND column_name='contact_mail') THEN
        ALTER TABLE terms_pages RENAME COLUMN contact_mail TO contact_email;
      END IF;
    END $$
  `);
  await run('rename contact_web → contact_website', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='terms_pages' AND column_name='contact_web') THEN
        ALTER TABLE terms_pages RENAME COLUMN contact_web TO contact_website;
      END IF;
    END $$
  `);
  await run('rename contact_tel → contact_phone', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='terms_pages' AND column_name='contact_tel') THEN
        ALTER TABLE terms_pages RENAME COLUMN contact_tel TO contact_phone;
      END IF;
    END $$
  `);
  await run('drop approval col (merged into intro)', `ALTER TABLE terms_pages DROP COLUMN IF EXISTS approval`);
  await run('drop copyright_notice col (merged into articles)', `ALTER TABLE terms_pages DROP COLUMN IF EXISTS copyright_notice`);

  // -------------------------------------------------------------------------
  // legal_notice_pages
  // -------------------------------------------------------------------------
  console.log('\n=== legal_notice_pages ===');
  await run('drop items json', `ALTER TABLE legal_notice_pages DROP COLUMN IF EXISTS items`);
  await run('convert intro text→jsonb', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='legal_notice_pages' AND column_name='intro' AND data_type='text') THEN
        ALTER TABLE legal_notice_pages ALTER COLUMN intro TYPE JSONB USING intro::JSONB;
      END IF;
    END $$
  `);
  await run('drop footer_label / footer_note', `ALTER TABLE legal_notice_pages DROP COLUMN IF EXISTS footer_label, DROP COLUMN IF EXISTS footer_note`);

  // -------------------------------------------------------------------------
  // impressum_pages
  // -------------------------------------------------------------------------
  console.log('\n=== impressum_pages ===');
  await run('drop sections json', `ALTER TABLE impressum_pages DROP COLUMN IF EXISTS sections`);

  // -------------------------------------------------------------------------
  // accessibility_pages
  // -------------------------------------------------------------------------
  console.log('\n=== accessibility_pages ===');
  await run('drop content col (replaced by intro+sections)', `ALTER TABLE accessibility_pages DROP COLUMN IF EXISTS content`);
  await run('add intro (blocks)', `ALTER TABLE accessibility_pages ADD COLUMN IF NOT EXISTS intro JSONB`);
  await run('drop footer_label / footer_note', `ALTER TABLE accessibility_pages DROP COLUMN IF EXISTS footer_label, DROP COLUMN IF EXISTS footer_note`);

  // -------------------------------------------------------------------------
  // csr_pages
  // -------------------------------------------------------------------------
  console.log('\n=== csr_pages ===');
  await run('drop sustainability_items json', `ALTER TABLE csr_pages DROP COLUMN IF EXISTS sustainability_items`);
  await run('drop social_items json', `ALTER TABLE csr_pages DROP COLUMN IF EXISTS social_items`);
  await run('drop governance_items json', `ALTER TABLE csr_pages DROP COLUMN IF EXISTS governance_items`);
  await run('drop sustainability_title', `ALTER TABLE csr_pages DROP COLUMN IF EXISTS sustainability_title`);
  await run('drop social_title', `ALTER TABLE csr_pages DROP COLUMN IF EXISTS social_title`);
  await run('drop governance_title', `ALTER TABLE csr_pages DROP COLUMN IF EXISTS governance_title`);
  await run('convert intro text→jsonb', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='csr_pages' AND column_name='intro' AND data_type='text') THEN
        ALTER TABLE csr_pages ALTER COLUMN intro TYPE JSONB USING intro::JSONB;
      END IF;
    END $$
  `);
  await run('convert scope text→jsonb', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='csr_pages' AND column_name='scope' AND data_type='text') THEN
        ALTER TABLE csr_pages ALTER COLUMN scope TYPE JSONB USING scope::JSONB;
      END IF;
    END $$
  `);

  // -------------------------------------------------------------------------
  // associated_clinics_pages
  // -------------------------------------------------------------------------
  console.log('\n=== associated_clinics_pages ===');
  await run('drop why_choose_items json', `ALTER TABLE associated_clinics_pages DROP COLUMN IF EXISTS why_choose_items`);
  await run('drop accordion_items json', `ALTER TABLE associated_clinics_pages DROP COLUMN IF EXISTS accordion_items`);
  await run('convert intro text→jsonb', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='associated_clinics_pages' AND column_name='intro' AND data_type='text') THEN
        ALTER TABLE associated_clinics_pages ALTER COLUMN intro TYPE JSONB USING intro::JSONB;
      END IF;
    END $$
  `);
  await run('rename view_list → view_list_label', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='associated_clinics_pages' AND column_name='view_list') THEN
        ALTER TABLE associated_clinics_pages RENAME COLUMN view_list TO view_list_label;
      END IF;
    END $$
  `);

  // -------------------------------------------------------------------------
  // open_days_pages
  // -------------------------------------------------------------------------
  console.log('\n=== open_days_pages ===');
  await run('drop event_sections json', `ALTER TABLE open_days_pages DROP COLUMN IF EXISTS event_sections`);
  await run('convert subtitle text→jsonb', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='open_days_pages' AND column_name='subtitle' AND data_type='text') THEN
        ALTER TABLE open_days_pages ALTER COLUMN subtitle TYPE JSONB USING subtitle::JSONB;
      END IF;
    END $$
  `);

  // -------------------------------------------------------------------------
  // free_trial_pages
  // -------------------------------------------------------------------------
  console.log('\n=== free_trial_pages ===');
  await run('drop intros json', `ALTER TABLE free_trial_pages DROP COLUMN IF EXISTS intros`);
  await run('drop event_sections json', `ALTER TABLE free_trial_pages DROP COLUMN IF EXISTS event_sections`);
  await run('drop subtitle', `ALTER TABLE free_trial_pages DROP COLUMN IF EXISTS subtitle`);
  await run('drop subtitle_highlight', `ALTER TABLE free_trial_pages DROP COLUMN IF EXISTS subtitle_highlight`);
  await run('drop subtitle_after', `ALTER TABLE free_trial_pages DROP COLUMN IF EXISTS subtitle_after`);
  await run('add intro (blocks)', `ALTER TABLE free_trial_pages ADD COLUMN IF NOT EXISTS intro JSONB`);

  // -------------------------------------------------------------------------
  // registration_thank_yous
  // -------------------------------------------------------------------------
  console.log('\n=== registration_thank_yous ===');
  await run('drop paragraphs json', `ALTER TABLE registration_thank_yous DROP COLUMN IF EXISTS paragraphs`);
  await run('add body (blocks)', `ALTER TABLE registration_thank_yous ADD COLUMN IF NOT EXISTS body JSONB`);
  await run('rename email → email_label', `
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='registration_thank_yous' AND column_name='email') THEN
        ALTER TABLE registration_thank_yous RENAME COLUMN email TO email_label;
      END IF;
    END $$
  `);

  await client.end();
  console.log('\nAll column migrations complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
