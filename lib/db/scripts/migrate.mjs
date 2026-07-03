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

  const defaultIntegrations = [
    { name: "Gmail", slug: "gmail", description: "Read and send email on your behalf.", category: "communication", scopes: "gmail.readonly gmail.send" },
    { name: "Google Calendar", slug: "googlecalendar", description: "View and manage calendar events.", category: "productivity", scopes: "calendar.events" },
    { name: "Slack", slug: "slack", description: "Send messages and monitor channels.", category: "communication", scopes: "chat:write channels:read" },
    { name: "GitHub", slug: "github", description: "Manage repos, issues, and pull requests.", category: "developer", scopes: "repo" },
    { name: "Google Drive", slug: "googledrive", description: "Access and organize files and folders.", category: "storage", scopes: "drive.file" },
    { name: "Notion", slug: "notion", description: "Read and update pages and databases.", category: "productivity", scopes: "" },
  ];

  for (const integ of defaultIntegrations) {
    await client.query(
      `INSERT INTO "integrations" ("name", "slug", "description", "category", "scopes")
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ("slug") DO NOTHING`,
      [integ.name, integ.slug, integ.description, integ.category, integ.scopes],
    );
  }
  console.log(`Seeded ${defaultIntegrations.length} default integrations (idempotent).`);

  await client.end();
  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
