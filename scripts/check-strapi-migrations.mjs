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

// Check strapi_migrations table
const m = await client.query(
  `SELECT * FROM strapi_migrations ORDER BY id DESC LIMIT 10`
).catch(() => ({ rows: [] }));

if (m.rows.length === 0) {
  console.log("No strapi_migrations table or empty");
} else {
  console.log("Recent Strapi migrations:");
  m.rows.forEach(r => console.log(" -", JSON.stringify(r)));
}

// Check strapi_core_store_settings for schema_version
const s = await client.query(
  `SELECT key, value FROM strapi_core_store_settings WHERE key LIKE '%schema%' ORDER BY id LIMIT 5`
).catch(() => ({ rows: [] }));

console.log("\nSchema store settings:", s.rows.length);
s.rows.forEach(r => console.log(" -", r.key, ":", r.value?.substring?.(0, 100)));

// Check all tables
const all = await client.query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
);
console.log("\nAll tables in public schema:");
all.rows.forEach(r => console.log(" -", r.table_name));

await client.end();
