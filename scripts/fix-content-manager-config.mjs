import pg from "pg";
import fs from "fs";
import path from "path";

const SYSTEM_FIELDS = new Set([
  "id",
  "documentId",
  "locale",
  "publishedAt",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
]);

const client = new pg.Client({
  host: "db.yqajmnsvvhyacorrurrk.supabase.co",
  port: 5432,
  user: "postgres",
  password: "base!vb3454",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

function collectApiSchemas() {
  const apiRoot = path.join(process.cwd(), "src", "api");
  const schemaByUid = new Map();

  for (const apiName of fs.readdirSync(apiRoot)) {
    const schemaPath = path.join(apiRoot, apiName, "content-types", apiName, "schema.json");
    if (!fs.existsSync(schemaPath)) continue;

    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
    const uid = `api::${apiName}.${apiName}`;
    const attrs = Object.keys(schema.attributes || {});
    schemaByUid.set(uid, new Set([...attrs, ...SYSTEM_FIELDS]));
  }

  return schemaByUid;
}

function sanitizeEditLayout(layoutEdit, allowedFields) {
  if (!Array.isArray(layoutEdit)) return layoutEdit;

  return layoutEdit
    .map((row) => {
      if (!Array.isArray(row)) return row;

      const sanitizedRow = row.filter((field) => {
        if (typeof field !== "string") return true;
        return allowedFields.has(field);
      });

      return sanitizedRow;
    })
    .filter((row) => !Array.isArray(row) || row.length > 0);
}

const schemaByUid = collectApiSchemas();
await client.connect();

const settings = await client.query(
  `SELECT id, key, value
   FROM strapi_core_store_settings
   WHERE key LIKE 'plugin_content_manager_configuration_content_types::api::%'
   ORDER BY key`
);

let updatedCount = 0;
for (const row of settings.rows) {
  const uid = row.key.replace("plugin_content_manager_configuration_content_types::", "");
  const allowedFields = schemaByUid.get(uid);
  if (!allowedFields) continue;

  let config;
  try {
    config = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
  } catch {
    console.log(`SKIP_INVALID_JSON | ${row.key}`);
    continue;
  }

  if (!config || typeof config !== "object") continue;

  const metadatas = config.metadatas && typeof config.metadatas === "object" ? config.metadatas : {};
  const nextMetadatas = {};
  for (const [field, metadata] of Object.entries(metadatas)) {
    if (allowedFields.has(field)) nextMetadatas[field] = metadata;
  }

  const nextLayoutEdit = sanitizeEditLayout(config.layouts?.edit, allowedFields);

  const removedMetadata = Object.keys(metadatas).filter((field) => !allowedFields.has(field));
  if (!removedMetadata.length) continue;

  const nextConfig = {
    ...config,
    metadatas: nextMetadatas,
    layouts: {
      ...(config.layouts || {}),
      edit: nextLayoutEdit,
    },
  };

  await client.query(
    `UPDATE strapi_core_store_settings SET value = $1 WHERE id = $2`,
    [JSON.stringify(nextConfig), row.id]
  );

  updatedCount += 1;
  console.log(`UPDATED | ${row.key} | removed: ${removedMetadata.join(", ")}`);
}

console.log(`DONE | updated entries: ${updatedCount}`);
await client.end();
