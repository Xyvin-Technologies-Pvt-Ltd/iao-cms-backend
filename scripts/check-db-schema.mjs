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

const r = await client.query(`SELECT schema FROM strapi_database_schema LIMIT 1`);
if (r.rows.length) {
  const raw = typeof r.rows[0].schema === 'string' ? r.rows[0].schema : JSON.stringify(r.rows[0].schema);
  const schema = JSON.parse(raw);
  const tables = Object.keys(schema.tables || {});
  console.log("Tables in strapi_database_schema:");
  tables.filter(t => t.includes('page') || t.includes('accessibility') || t.includes('cookies') || t.includes('disclaimer') || t.includes('terms') || t.includes('privacy') || t.includes('newsletter') || t.includes('impressum') || t.includes('csr') || t.includes('complaints') || t.includes('ebook') || t.includes('free_trial') || t.includes('legal_notice') || t.includes('open_days') || t.includes('associated')).forEach(t => console.log(" -", t));
  console.log("\nTotal tables in schema:", tables.length);
} else {
  console.log("No strapi_database_schema record found");
}

await client.end();
