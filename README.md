# Gojo Solutions PLC — Corporate Website

Corporate website for Gojo Solutions PLC (Addis Ababa), the parent company of
Gojo Shop (gojoshop.et). Built with TanStack Start + Tailwind v4 + SQLite CMS.

## Getting started

### Prerequisites

- [Bun](https://bun.sh) **required** — SQLite uses `bun:sqlite`, so the app must
  run under the Bun runtime (dev and production). Plain Node (`node vite`) will fail.

#### Install Bun (if not already installed)

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.zshrc   # or restart your terminal
```

### Install dependencies

```bash
bun install
```

### Database (auto-seeds on first boot)

SQLite lives at `data/gojo.db`. On first run the app creates tables and seeds
content from `src/lib/content.ts`. You can also seed manually:

```bash
bun run db:seed          # skip if already seeded
bun run db:reseed        # wipe + reseed (destructive)
```

### Run the dev server

```bash
bun run dev
```

(`bun run dev` uses `bun --bun vite` so SSR can open SQLite.)

The app starts at **http://localhost:5173** (Vite may pick the next free port).

Admin panel: **/admin/login**

Default credentials (change on first login):

- Username: `admin`
- Password: `ChangeMe123!`

### Production (copy whole project to a VPS)

```bash
bun install
bun run db:seed          # first time only (or copy an existing data/gojo.db)
bun run build
PORT=3000 NODE_ENV=production bun run start
```

Keep these directories persistent across deploys:

- `data/` — SQLite database (`gojo.db`)
- `public/uploads/` — admin-uploaded images

Optional env vars:

| Variable | Purpose |
|---|---|
| `GOJO_PROJECT_ROOT` | Absolute project root if cwd is not the repo |
| `GOJO_DB_PATH` | Absolute path to SQLite (default `./data/gojo.db`) |
| `GOJO_UPLOADS_DIR` | Absolute uploads dir (default `./public/uploads`) |
| `GOJO_SITE_URL` | Absolute site URL for sitemap `<loc>` values |
| `NODE_ENV` | Set `production` (enables secure cookies) |
| `PORT` | Listen port for the production server |

## Admin CMS

All visible site content is editable at `/admin`.

For a full walkthrough of **what to edit where** (pages, images, messages, partnerships), see **[SITE_MANUAL.md](./SITE_MANUAL.md)**.

Quick map:

- Company info, logo, navigation, SEO meta
- Home / About / What We Do / Gojo Shop / Partnerships / Contact
- Capabilities, Promise, Audiences, Founders
- Messages inbox (contact form submissions)
- Media library (files under `public/uploads/`)
- Admin password

## Image storage (`public/uploads/`)

All admin-uploaded images are saved on disk under **`public/uploads/`**, not in
the database. The DB only stores the public path (e.g. `/uploads/logo/logo-primary-….png`).
Because the folder is under `public/`, the site serves those files as static
assets at the same URL.

```
public/uploads/
├── logo/          Site logos (primary, dark, favicon, OG variants)
├── gojo-shop/     Gojo Shop workflow / product screenshots
├── founders/      Founder profile photos
├── partners/      Partner / institutional logos
├── capabilities/  Capability page hero & card images
├── og/            Open Graph / social share images
└── general/       Anything else (Media Library default bucket)
```

| Folder | Used for |
|---|---|
| `logo/` | Logo manager uploads |
| `gojo-shop/` | Workflow images on the Gojo Shop page |
| `founders/` | Founder photos on About |
| `partners/` | Partner type logos on Partnerships |
| `capabilities/` | Hero / card images for capability pages |
| `og/` | Global / page social preview images |
| `general/` | Free-form uploads from Media Library |

Rules:

- Max **5 MB** per file
- Allowed types: PNG, JPEG, WebP, SVG, ICO
- Filenames are sanitised (kebab-case + timestamp) to avoid collisions
- Replacing a logo / founder photo / workflow image deletes the old file from disk
- Browse, copy path, or delete files in **/admin/media**

When you copy the project to a server, keep **`public/uploads/`** (and `data/`)
intact so existing images keep working. You can override the location with
`GOJO_UPLOADS_DIR` if you want uploads outside the repo.

## Design system

Anchored on the brand deep green `#003E15`, warmed with an Ethiopian-inflected
ochre and cream background. Use the semantic tokens in `src/styles.css`:

- `bg-primary` / `text-primary` — deep green
- `bg-accent` / `text-accent` — ochre
- `bg-background` / `text-foreground` — cream / ink
- `font-display` (Fraunces) for headings, `font-sans` (Inter) for body

Utility classes: `.container-page`, `.eyebrow`, `.rule-ochre`.

## Fallback

`src/lib/content.ts` remains the seed source and a runtime fallback if the DB
is empty or unavailable, so the public site never renders blank content.
