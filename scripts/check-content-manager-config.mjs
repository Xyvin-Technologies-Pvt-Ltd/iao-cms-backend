import pg from "pg";
import fs from "fs";
import path from "path";

const client = new pg.Client({
  host: "db.yqajmnsvvhyacorrurrk.supabase.co",
  port: 5432,
  user: "postgres",
  password: "base!vb3454",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const result = await client.query(
  `SELECT key, value
   FROM strapi_core_store_settings
   WHERE key LIKE 'plugin_content_manager_configuration_content_types::%'
   ORDER BY key`
);

const apiRoot = path.join(process.cwd(), "src", "api");
const schemaByUid = new Map();
for (const apiName of fs.readdirSync(apiRoot)) {
  const schemaPath = path.join(apiRoot, apiName, "content-types", apiName, "schema.json");
  if (!fs.existsSync(schemaPath)) continue;
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const uid = `api::${apiName}.${apiName}`;
  schemaByUid.set(uid, schema);
}

for (const row of result.rows) {
  const key = row.key;
  let value;
  try {
    value = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
  } catch {
    console.log(`INVALID_JSON | ${key}`);
    continue;
  }

  const metadatas = value?.metadatas && typeof value.metadatas === "object" ? Object.keys(value.metadatas) : [];
  const layouts = Array.isArray(value?.layouts?.edit)
    ? value.layouts.edit.flat().filter((item) => typeof item === "string")
    : [];
  const uid = key.replace("plugin_content_manager_configuration_content_types::", "");
  const schema = schemaByUid.get(uid);
  const schemaAttrs = schema?.attributes ? Object.keys(schema.attributes) : [];

  const stale = layouts.filter((field) => !metadatas.includes(field));
  if (stale.length) {
    console.log(`STALE_LAYOUT_FIELDS | ${key} | ${stale.join(", ")}`);
  }

  const missingInSchema = metadatas.filter((field) => !schemaAttrs.includes(field));
  if (missingInSchema.length) {
    console.log(`METADATA_NOT_IN_SCHEMA | ${key} | ${missingInSchema.join(", ")}`);
  }

  const missingInMetadata = schemaAttrs.filter((field) => !metadatas.includes(field));
  if (missingInMetadata.length) {
    console.log(`SCHEMA_NOT_IN_METADATA | ${key} | ${missingInMetadata.join(", ")}`);
  }
}

await client.end();
