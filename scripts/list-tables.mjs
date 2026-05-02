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
const r = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
r.rows.forEach(row => console.log(row.tablename));
await client.end();
