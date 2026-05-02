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

const expected = [
  'accessibility_pages',
  'associated_clinics_pages',
  'complaints_pages',
  'cookies_pages',
  'csr_pages',
  'disclaimer_pages',
  'ebook_pages',
  'free_trial_pages',
  'impressum_pages',
  'legal_notice_pages',
  'newsletter_pages',
  'open_days_pages',
  'privacy_pages',
  'terms_pages',
  'registration_thank_yous',
];

await client.connect();
for (const t of expected) {
  const r = await client.query(
    `SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=$1) AS exists`, [t]
  );
  console.log(`${r.rows[0].exists ? '✓' : '✗'} ${t}`);
}
await client.end();
