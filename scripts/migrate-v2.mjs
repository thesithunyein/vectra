/**
 * Apply supabase/schema-v2-tenants.sql when SUPABASE_DB_URL is set.
 *
 * Get connection string: Supabase Dashboard → Project Settings → Database → URI
 * (use "Session pooler" or direct connection, replace [YOUR-PASSWORD])
 *
 *   set SUPABASE_DB_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
 *   node scripts/migrate-v2.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
    }
  } catch {
    // ignore
  }
}

loadEnv();

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error(`
Missing SUPABASE_DB_URL.

1. Open https://supabase.com/dashboard/project/ahaousuahjwavkmaezdu/settings/database
2. Copy the URI (replace [YOUR-PASSWORD] with your database password)
3. Add to .env.local:
   SUPABASE_DB_URL=postgresql://postgres.ahaousuahjwavkmaezdu:YOUR_PASSWORD@...

Or paste supabase/schema-v2-tenants.sql into SQL Editor:
https://supabase.com/dashboard/project/ahaousuahjwavkmaezdu/sql/new
`);
  process.exit(1);
}

const sql = readFileSync(resolve(root, "supabase/schema-v2-tenants.sql"), "utf8");
const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("Connected. Applying schema-v2-tenants.sql…");
  await client.query(sql);
  console.log("Done. plant_tenants and related tables are ready.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
