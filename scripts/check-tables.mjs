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
console.log("✓ Connected");

const r = await client.query(
  `SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name LIKE '%page%' 
   ORDER BY table_name`
);
console.log("Tables with 'page':");
r.rows.forEach(row => console.log(" -", row.table_name));

const r2 = await client.query(
  `SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'accessibility_pages','associated_clinics_pages','cookies_pages','complaints_pages',
     'csr_pages','disclaimer_pages','ebook_pages','free_trial_pages','legal_notice_pages',
     'impressum_pages','newsletter_pages','open_days_pages','privacy_pages','terms_pages'
   )
   ORDER BY table_name`
);
console.log("\nNew page tables found:", r2.rows.length);
r2.rows.forEach(row => console.log(" ✅", row.table_name));

const missing = [
  'accessibility_pages','associated_clinics_pages','cookies_pages','complaints_pages',
  'csr_pages','disclaimer_pages','ebook_pages','free_trial_pages','legal_notice_pages',
  'impressum_pages','newsletter_pages','open_days_pages','privacy_pages','terms_pages'
].filter(t => !r2.rows.find(r => r.table_name === t));
if (missing.length) {
  console.log("\nMissing tables (Strapi hasn't migrated yet):");
  missing.forEach(t => console.log(" ❌", t));
} else {
  console.log("\n✅ All 14 tables exist!");
}

await client.end();
