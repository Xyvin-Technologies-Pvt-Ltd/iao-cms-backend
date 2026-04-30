/**
 * seed-contact-page.mjs
 *
 * Directly inserts Contact Page content (all 4 locales) into PostgreSQL.
 * Run from project root:
 *   node scripts/seed-contact-page.mjs
 */

import pg from "pg";
import crypto from "crypto";

const client = new pg.Client({
  host: "db.yqajmnsvvhyacorrurrk.supabase.co",
  port: 5432,
  user: "postgres",
  password: "base!vb3454",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

const uid = () => crypto.randomBytes(16).toString("hex").slice(0, 20);

// ─── Seed data (only CMS-owned copy — runtime states stay in dictionary) ─────

const localeData = {
  en: {
    title: "Contact",
    form: {
      firstNameLabel: "First name",
      lastNameLabel: "Last name",
      emailLabel: "Email address",
      messageLabel: "Message",
      consentBefore: "I agree to the ",
      consentLinkText: "Privacy Policy",
      consentAfter: ".*",
      submitLabel: "Send your message",
    },
  },
  nl: {
    title: "Contacteer ons",
    form: {
      firstNameLabel: "Voornaam",
      lastNameLabel: "Naam",
      emailLabel: "E-mail",
      messageLabel: "Bericht",
      consentBefore: "Ik ga akkoord met het ",
      consentLinkText: "Privacybeleid",
      consentAfter: ".*",
      submitLabel: "Stuur uw bericht",
    },
  },
  fr: {
    title: "Contactez-nous",
    form: {
      firstNameLabel: "Pr\u00e9nom",
      lastNameLabel: "Nom de famille",
      emailLabel: "Adresse mail",
      messageLabel: "Message",
      consentBefore: "J\u2019accepte la ",
      consentLinkText: "politique de confidentialit\u00e9",
      consentAfter: ".*",
      submitLabel: "Envoyer votre message",
    },
  },
  de: {
    title: "Kontaktieren Sie uns",
    form: {
      firstNameLabel: "Vorname",
      lastNameLabel: "Nachname",
      emailLabel: "E-Mail",
      messageLabel: "Nachricht",
      consentBefore: "Ich stimme der ",
      consentLinkText: "Datenschutzrichtlinie",
      consentAfter: " zu.*",
      submitLabel: "Nachricht senden",
    },
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

await client.connect();
console.log("✓ Connected to PostgreSQL\n");

const now = new Date();

// ── Inspect current contact_pages table columns ──────────────────────────────
const colRes = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'contact_pages'
  ORDER BY ordinal_position
`);
console.log("contact_pages columns:", colRes.rows.map((r) => r.column_name).join(", "), "\n");

// ── Check contact form component table ───────────────────────────────────────
const cmpColRes = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'components_contact_forms'
  ORDER BY ordinal_position
`).catch(() => ({ rows: [] }));

if (cmpColRes.rows.length === 0) {
  console.error("❌ Table 'components_contact_forms' does not exist yet.");
  console.error("   Strapi needs to restart first to create it from the new schema.");
  console.error("   Wait for Strapi to rebuild, then re-run this script.");
  await client.end();
  process.exit(1);
}
console.log("components_contact_forms columns:", cmpColRes.rows.map((r) => r.column_name).join(", "), "\n");

// ── Wipe existing contact page data ──────────────────────────────────────────
console.log("🗑  Clearing existing contact page data...");
const existingPages = await client.query("SELECT id FROM contact_pages");
for (const row of existingPages.rows) {
  const links = await client.query(
    "SELECT cmp_id, component_type FROM contact_pages_cmps WHERE entity_id = $1",
    [row.id]
  );
  for (const link of links.rows) {
    await client.query(`DELETE FROM components_contact_forms WHERE id = $1`, [link.cmp_id]);
  }
  await client.query("DELETE FROM contact_pages_cmps WHERE entity_id = $1", [row.id]);
}
await client.query("DELETE FROM contact_pages");
console.log("   Done.\n");

// All locales share one document_id
const documentId = uid();
console.log(`📄 document_id: ${documentId}\n`);

for (const [locale, data] of Object.entries(localeData)) {
  console.log(`🌍 Seeding [${locale}]...`);

  // 1. Insert contact_pages row
  const pageRes = await client.query(
    `INSERT INTO contact_pages (document_id, locale, title, published_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [documentId, locale, data.title, now, now, now]
  );
  const pageId = pageRes.rows[0].id;

  // 2. Insert form component
  const f = data.form;
  const formRes = await client.query(
    `INSERT INTO components_contact_forms
       (first_name_label, last_name_label, email_label, message_label,
        consent_before, consent_link_text, consent_after, submit_label)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      f.firstNameLabel,
      f.lastNameLabel,
      f.emailLabel,
      f.messageLabel,
      f.consentBefore,
      f.consentLinkText,
      f.consentAfter,
      f.submitLabel,
    ]
  );
  const formId = formRes.rows[0].id;

  // 3. Link form component to page
  await client.query(
    `INSERT INTO contact_pages_cmps (entity_id, cmp_id, component_type, field, "order")
     VALUES ($1, $2, $3, $4, $5)`,
    [pageId, formId, "contact.form", "form", 1]
  );

  console.log(`  ✅ [${locale}] page_id=${pageId}, form_id=${formId}`);
}

await client.end();
console.log("\n🎉 Done! All 4 locales seeded for Contact Page.");
