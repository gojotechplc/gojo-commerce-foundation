import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { schema } from "./schema";

/**
 * Resolve project root whether running from:
 * - `bun --bun run dev` (cwd = project root)
 * - production server after copy (cwd = project root)
 * - nested scripts (`bun db/seed.ts`)
 *
 * IMPORTANT: Vite SSR must run under Bun (`bun --bun …`) so `bun:sqlite` is available.
 * See package.json scripts.
 */
export function getProjectRoot(): string {
  const fromEnv = process.env.GOJO_PROJECT_ROOT?.trim();
  if (fromEnv) return resolve(fromEnv);
  return resolve(process.cwd());
}

export function getDbPath(): string {
  const fromEnv = process.env.GOJO_DB_PATH?.trim();
  if (fromEnv) return resolve(fromEnv);
  return join(getProjectRoot(), "data", "gojo.db");
}

export function getUploadsRoot(): string {
  const fromEnv = process.env.GOJO_UPLOADS_DIR?.trim();
  if (fromEnv) return resolve(fromEnv);
  return join(getProjectRoot(), "public", "uploads");
}

const DDL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  force_password_change INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS company_info (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  positioning TEXT NOT NULL,
  location TEXT NOT NULL,
  shop_url TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS logo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant TEXT NOT NULL,
  file_path TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS global_meta (
  id INTEGER PRIMARY KEY,
  site_title TEXT NOT NULL,
  site_description TEXT NOT NULL,
  author TEXT NOT NULL,
  og_site_name TEXT NOT NULL,
  og_title TEXT NOT NULL,
  og_description TEXT NOT NULL,
  og_type TEXT NOT NULL DEFAULT 'website',
  og_image_path TEXT,
  twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
  twitter_title TEXT NOT NULL,
  twitter_description TEXT NOT NULL,
  twitter_image_path TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS nav_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS footer_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS promise_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS capabilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_desc TEXT NOT NULL,
  strategic_purpose TEXT NOT NULL,
  body TEXT,
  page_eyebrow TEXT,
  hero_image_path TEXT,
  card_image_path TEXT,
  meta_title TEXT,
  meta_description TEXT,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS capability_functions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  capability_id INTEGER NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS about_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS founders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_path TEXT,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS home_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_key TEXT NOT NULL UNIQUE,
  eyebrow TEXT,
  heading TEXT,
  body TEXT,
  cta_label TEXT,
  cta_href TEXT,
  cta2_label TEXT,
  cta2_href TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  og_title TEXT NOT NULL,
  og_description TEXT NOT NULL,
  og_url TEXT NOT NULL,
  canonical TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gojo_shop_page (
  id INTEGER PRIMARY KEY,
  hero_eyebrow TEXT NOT NULL,
  hero_heading TEXT NOT NULL,
  hero_body TEXT NOT NULL,
  hero_cta_label TEXT NOT NULL,
  stat1_label TEXT NOT NULL,
  stat1_value TEXT NOT NULL,
  stat2_label TEXT NOT NULL,
  stat2_value TEXT NOT NULL,
  stat3_label TEXT NOT NULL,
  stat3_value TEXT NOT NULL,
  stat4_label TEXT NOT NULL,
  stat4_value TEXT NOT NULL,
  workflow_eyebrow TEXT NOT NULL,
  workflow_heading TEXT NOT NULL,
  promise_eyebrow TEXT NOT NULL,
  promise_heading TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gojo_shop_workflow_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_path TEXT,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS partnerships_page (
  id INTEGER PRIMARY KEY,
  header_eyebrow TEXT NOT NULL,
  header_heading TEXT NOT NULL,
  header_body TEXT NOT NULL,
  vendor_section_eyebrow TEXT,
  vendor_section_heading TEXT,
  standards_eyebrow TEXT NOT NULL,
  standards_heading TEXT NOT NULL,
  standards_body TEXT NOT NULL,
  institutional_eyebrow TEXT NOT NULL,
  institutional_heading TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  cta_subtitle TEXT NOT NULL,
  cta_button_label TEXT NOT NULL,
  cta_button_href TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vendor_value_props (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS partnership_standards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS partner_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  example TEXT,
  body TEXT NOT NULL,
  logo_path TEXT,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_page (
  id INTEGER PRIMARY KEY,
  header_eyebrow TEXT NOT NULL,
  header_heading TEXT NOT NULL,
  header_body TEXT NOT NULL,
  head_office_label TEXT NOT NULL DEFAULT 'Head office',
  email_label TEXT NOT NULL DEFAULT 'Email',
  phone_label TEXT NOT NULL DEFAULT 'Phone',
  phone_number TEXT DEFAULT '+251982808182',
  show_phone INTEGER NOT NULL DEFAULT 1,
  platform_label TEXT NOT NULL DEFAULT 'Platform',
  form_note TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_interest_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS about_page_header (
  id INTEGER PRIMARY KEY,
  eyebrow TEXT NOT NULL,
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS what_we_do_page_header (
  id INTEGER PRIMARY KEY,
  eyebrow TEXT NOT NULL,
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  interest TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'contact',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const UPLOAD_CATEGORIES = ["logo", "gojo-shop", "founders", "partners", "og", "general", "capabilities"] as const;

function ensureUploadDirs() {
  const root = getUploadsRoot();
  for (const cat of UPLOAD_CATEGORIES) {
    const dir = join(root, cat);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

let sqlite: Database | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let seeded = false;

export function getSqlite(): Database {
  if (typeof Bun === "undefined") {
    throw new Error(
      "SQLite requires the Bun runtime. Use `bun --bun run dev` / `bun --bun run start` (see package.json).",
    );
  }
  if (sqlite) return sqlite;
  const dbPath = getDbPath();
  mkdirSync(dirname(dbPath), { recursive: true });
  ensureUploadDirs();
  sqlite = new Database(dbPath, { create: true });
  sqlite.exec("PRAGMA journal_mode = WAL;");
  sqlite.exec("PRAGMA foreign_keys = ON;");
  sqlite.exec(DDL);
  migrateCapabilitiesColumns(sqlite);
  migrateContactMessagesColumns(sqlite);
  migrateContactPageColumns(sqlite);
  return sqlite;
}

/** Additive columns for existing DBs created before page fields existed. */
function migrateCapabilitiesColumns(db: Database) {
  const cols = new Set(
    db
      .query("PRAGMA table_info(capabilities)")
      .all()
      .map((r) => (r as { name: string }).name),
  );
  const add = (name: string, ddl: string) => {
    if (!cols.has(name)) db.exec(`ALTER TABLE capabilities ADD COLUMN ${ddl}`);
  };
  add("body", "body TEXT");
  add("page_eyebrow", "page_eyebrow TEXT");
  add("hero_image_path", "hero_image_path TEXT");
  add("card_image_path", "card_image_path TEXT");
  add("meta_title", "meta_title TEXT");
  add("meta_description", "meta_description TEXT");
}

function migrateContactMessagesColumns(db: Database) {
  const exists = db
    .query("SELECT name FROM sqlite_master WHERE type='table' AND name='contact_messages'")
    .get();
  if (!exists) return;
  const cols = new Set(
    db
      .query("PRAGMA table_info(contact_messages)")
      .all()
      .map((r) => (r as { name: string }).name),
  );
  if (!cols.has("phone")) db.exec(`ALTER TABLE contact_messages ADD COLUMN phone TEXT`);
}

function migrateContactPageColumns(db: Database) {
  const exists = db
    .query("SELECT name FROM sqlite_master WHERE type='table' AND name='contact_page'")
    .get();
  if (!exists) return;
  const cols = new Set(
    db
      .query("PRAGMA table_info(contact_page)")
      .all()
      .map((r) => (r as { name: string }).name),
  );
  if (!cols.has("phone_label")) {
    db.exec(`ALTER TABLE contact_page ADD COLUMN phone_label TEXT NOT NULL DEFAULT 'Phone'`);
  }
  if (!cols.has("phone_number")) {
    db.exec(
      `ALTER TABLE contact_page ADD COLUMN phone_number TEXT DEFAULT '+251982808182'`,
    );
  }
  if (!cols.has("show_phone")) {
    db.exec(`ALTER TABLE contact_page ADD COLUMN show_phone INTEGER NOT NULL DEFAULT 1`);
  }
  // Backfill default number if empty
  db.exec(
    `UPDATE contact_page SET phone_number = '+251982808182' WHERE phone_number IS NULL OR trim(phone_number) = ''`,
  );
}

export function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = drizzle(getSqlite(), { schema });
  return dbInstance;
}

export type Db = ReturnType<typeof getDb>;

/** Seed if company_info is empty. Safe to call on every boot. */
export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  const db = getDb();
  const row = db.query.companyInfo.findFirst();
  if (row) {
    seeded = true;
    return;
  }
  const { runSeed } = await import("./seed");
  await runSeed();
  seeded = true;
}
