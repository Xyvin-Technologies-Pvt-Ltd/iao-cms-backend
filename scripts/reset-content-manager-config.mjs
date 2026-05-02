import pg from "pg";

const client = new pg.Client({
  host: "db.yqajmnsvvhyacorrurrk.supabase.co",
  port: 5432,
  user: "postgres",
  password: "base!vb3454",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

const KEYS_TO_RESET = [
  "plugin_content_manager_configuration_content_types::api::about-page.about-page",
  "plugin_content_manager_configuration_content_types::api::contact-page.contact-page",
  "plugin_content_manager_configuration_content_types::api::registration-thank-you.registration-thank-you",
];

await client.connect();

for (const key of KEYS_TO_RESET) {
  const { rowCount } = await client.query(
    `DELETE FROM strapi_core_store_settings WHERE key = $1`,
    [key]
  );
  console.log(`${rowCount ? "RESET" : "NOT_FOUND"} | ${key}`);
}

await client.end();
