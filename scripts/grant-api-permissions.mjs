/**
 * grant-api-permissions.mjs
 *
 * Grants "find" permission to the authenticated role for all 14 new page types.
 * This allows the API token to access them without public exposure.
 *
 *   node scripts/grant-api-permissions.mjs
 */

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
console.log("✓ Connected\n");

// Check what roles exist in up_roles
const roles = await client.query(`SELECT id, name, type FROM up_roles ORDER BY id`);
console.log("Roles:");
roles.rows.forEach(r => console.log(`  id=${r.id} name=${r.name} type=${r.type}`));

// Check existing permissions structure
const existingPerms = await client.query(
  `SELECT action FROM up_permissions WHERE action LIKE '%about-page%' LIMIT 5`
);
console.log("\nExisting about-page permissions:", existingPerms.rows.map(r => r.action));

// Check api token permissions
const tokenPerms = await client.query(
  `SELECT sap.action FROM strapi_api_token_permissions sap 
   JOIN strapi_api_tokens sat ON sat.id = sap.token_id 
   WHERE sap.action LIKE '%about-page%' LIMIT 5`
);
console.log("API token permissions for about-page:", tokenPerms.rows.map(r => r.action));

// Check the token
const tokens = await client.query(
  `SELECT id, name, type FROM strapi_api_tokens ORDER BY id`
);
console.log("\nAPI Tokens:");
tokens.rows.forEach(r => console.log(`  id=${r.id} name=${r.name} type=${r.type}`));

// Check api token permission structure
const tokenPermSample = await client.query(
  `SELECT * FROM strapi_api_token_permissions LIMIT 3`
);
console.log("\nSample token permissions:", tokenPermSample.rows);

await client.end();
