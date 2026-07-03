import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "drizzle");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set, skipping migration");
  process.exit(0);
}

const useSsl = /\.render\.com/.test(process.env.DATABASE_URL) || /sslmode=require/.test(process.env.DATABASE_URL);
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

async function main() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS "__migrations_applied" (
      "name" text PRIMARY KEY,
      "applied_at" timestamp DEFAULT now()
    );
  `);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const { rows } = await client.query(
      `SELECT 1 FROM "__migrations_applied" WHERE "name" = $1`,
      [file],
    );
    if (rows.length > 0) {
      console.log(`skip (already applied): ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = sql.split("--> statement-breakpoint");

    console.log(`applying: ${file} (${statements.length} statements)`);
    await client.query("BEGIN");
    try {
      for (const stmt of statements) {
        const trimmed = stmt.trim();
        if (!trimmed) continue;
        await client.query(trimmed);
      }
      await client.query(
        `INSERT INTO "__migrations_applied" ("name") VALUES ($1)`,
        [file],
      );
      await client.query("COMMIT");
      console.log(`applied: ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  }

  await client.end();
  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
