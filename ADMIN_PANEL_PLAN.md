# Admin Panel — Detailed Implementation Plan

> **Scope:** Full CMS-style admin panel backed by SQLite that makes every piece
> of visible content on the Gojo Solutions PLC corporate site editable at
> runtime. A single admin account controls all content. Images are stored on
> disk in an organised directory tree and served as static assets.
>
> **Do not start implementation until this plan is approved.**

---

## Table of Contents

1. [Stack & Architecture](#1-stack--architecture)
2. [Directory Layout](#2-directory-layout)
3. [Database Schema (SQLite)](#3-database-schema-sqlite)
4. [Image Storage Strategy](#4-image-storage-strategy)
5. [Authentication](#5-authentication)
6. [API Layer — Server Routes](#6-api-layer--server-routes)
7. [Admin UI — Pages & Forms](#7-admin-ui--pages--forms)
8. [Public Site Integration](#8-public-site-integration)
9. [Content Map — Every Field Made Dynamic](#9-content-map--every-field-made-dynamic)
10. [Implementation Phases](#10-implementation-phases)
11. [File-by-File Change Summary](#11-file-by-file-change-summary)

---

## 1. Stack & Architecture

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Bun | Already in use (`bun.lock`) |
| Framework | TanStack Start (already in use) | Server routes + SSR built in |
| Database | **SQLite via `bun:sqlite`** | Zero-config, file-based, ships with Bun |
| ORM / Query | **Drizzle ORM** | Type-safe, Bun-compatible, great SQLite support |
| Auth | **HTTP-only cookie + bcrypt** | Single admin, no OAuth needed |
| File uploads | **Multipart form → local disk** | Organised under `public/uploads/` |
| Admin UI | React (existing) + shadcn/ui (already in use) | Stays in the same repo |

### Request Flow (Public Pages)

```
Browser → TanStack Start loader → Drizzle query → SQLite → JSON → React component
```

### Request Flow (Admin Panel)

```
Admin browser → /admin/* routes (server-rendered)
     → auth middleware (check session cookie)
     → Admin React pages with shadcn forms
     → POST /api/admin/* server routes
     → Drizzle mutations → SQLite
     → (if image) save file to public/uploads/[category]/
     → redirect back to admin page
```

---

## 2. Directory Layout

New files and folders are marked with `[NEW]`.

```
gojo-commerce-foundation/
├── db/                              [NEW]
│   ├── schema.ts                    [NEW]  Drizzle table definitions
│   ├── client.ts                    [NEW]  Singleton Bun SQLite connection
│   ├── migrations/                  [NEW]  Auto-generated SQL migrations
│   └── seed.ts                      [NEW]  Seeds DB from current content.ts values
│
├── public/
│   └── uploads/                     [NEW]  All admin-uploaded images
│       ├── logo/                    [NEW]  Logo files (svg, png, ico)
│       ├── gojo-shop/               [NEW]  Gojo Shop workflow images
│       ├── founders/                [NEW]  Founder profile photos
│       ├── partners/                [NEW]  Partner logos
│       ├── og/                      [NEW]  OG / social share images
│       └── general/                 [NEW]  Anything that doesn't fit above
│
├── src/
│   ├── lib/
│   │   ├── content.ts               KEEP AS FALLBACK — seeded into DB on first run
│   │   ├── db.server.ts             [NEW]  Re-exports Drizzle client (server-only)
│   │   └── session.server.ts        [NEW]  Cookie session helpers
│   │
│   ├── routes/
│   │   ├── __root.tsx               MODIFY — pull global meta from DB
│   │   ├── index.tsx                MODIFY — loaders replace hardcoded content
│   │   ├── about.tsx                MODIFY — loaders replace hardcoded content
│   │   ├── what-we-do.tsx           MODIFY — loaders replace hardcoded content
│   │   ├── gojo-shop.tsx            MODIFY — loaders replace hardcoded content
│   │   ├── partnerships.tsx         MODIFY — loaders replace hardcoded content
│   │   ├── contact.tsx              MODIFY — loaders replace hardcoded content
│   │   ├── sitemap[.]xml.ts         MODIFY — dynamic from DB
│   │   │
│   │   └── admin/                   [NEW]  All admin routes (protected)
│   │       ├── __layout.tsx         [NEW]  Auth guard + admin shell/sidebar
│   │       ├── index.tsx            [NEW]  Dashboard overview
│   │       ├── login.tsx            [NEW]  Login page (public)
│   │       ├── company.tsx          [NEW]  Company info editor
│   │       ├── logo.tsx             [NEW]  Logo upload & management
│   │       ├── navigation.tsx       [NEW]  Nav link order editor
│   │       ├── meta.tsx             [NEW]  Global SEO / OG meta editor
│   │       ├── home.tsx             [NEW]  Home page section editors
│   │       ├── about.tsx            [NEW]  About page editor
│   │       ├── capabilities.tsx     [NEW]  Capabilities list editor
│   │       ├── capabilities.$id.tsx [NEW]  Single capability editor
│   │       ├── promise.tsx          [NEW]  Gojo Promise items editor
│   │       ├── audiences.tsx        [NEW]  Audiences editor
│   │       ├── gojo-shop.tsx        [NEW]  Gojo Shop page editor + image uploads
│   │       ├── partnerships.tsx     [NEW]  Partnerships page editor
│   │       ├── contact.tsx          [NEW]  Contact page & form options editor
│   │       ├── founders.tsx         [NEW]  Founders list editor
│   │       ├── media.tsx            [NEW]  Image library browser
│   │       └── settings.tsx         [NEW]  Admin account (password change)
│   │
│   └── components/
│       ├── site-chrome.tsx          MODIFY — pulls logo + nav from DB
│       ├── hub-spoke.tsx            MODIFY — pulls capability titles from DB
│       └── admin/                   [NEW]  Shared admin UI components
│           ├── sidebar.tsx          [NEW]
│           ├── image-upload.tsx     [NEW]  Reusable file upload widget
│           ├── rich-textarea.tsx    [NEW]  Plain textarea (no WYSIWYG needed)
│           └── sortable-list.tsx    [NEW]  Drag-to-reorder for ordered lists
│
└── ADMIN_PANEL_PLAN.md              THIS FILE
```

---

## 3. Database Schema (SQLite)

File: `db/schema.ts`

Every section of the public site maps to one or more tables below. All
`updated_at` columns are updated automatically via Drizzle triggers.

---

### 3.1 `admin_users`

Single-row table. Only one account will ever exist.

```ts
admin_users {
  id          integer  PRIMARY KEY AUTOINCREMENT
  username    text     NOT NULL UNIQUE          -- e.g. "admin"
  password_hash text   NOT NULL                 -- bcrypt hash
  created_at  text     DEFAULT (datetime('now'))
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.2 `company_info`

Single-row table. Controls sitewide company data used across all pages and
in `content.ts` today.

```ts
company_info {
  id            integer  PRIMARY KEY  -- always 1
  name          text     NOT NULL     -- "Gojo Solutions PLC"
  short_name    text     NOT NULL     -- "Gojo Solutions"
  tagline       text     NOT NULL     -- "Identify the problem…"
  positioning   text     NOT NULL     -- long paragraph used on hero + about
  location      text     NOT NULL     -- "Addis Ababa, Ethiopia"
  shop_url      text     NOT NULL     -- "https://gojoshop.et"
  contact_email text     NOT NULL     -- "info@gojosolutions.et"
  updated_at    text     DEFAULT (datetime('now'))
}
```

---

### 3.3 `logo`

Tracks the active logo asset and any alternates.

```ts
logo {
  id          integer  PRIMARY KEY AUTOINCREMENT
  variant     text     NOT NULL   -- "primary" | "dark" | "favicon" | "og"
  file_path   text     NOT NULL   -- e.g. "/uploads/logo/logo-primary.svg"
  alt_text    text     NOT NULL
  is_active   integer  NOT NULL DEFAULT 1  -- 1 = shown on site
  uploaded_at text     DEFAULT (datetime('now'))
}
```

The current text-based logo (`"G" box + "Gojo Solutions" + "PLC"`) is the
default until a real image is uploaded. The site chrome checks this table
first; if no active image logo exists it falls back to the text mark.

---

### 3.4 `global_meta`

Controls the `<head>` defaults in `__root.tsx` and per-page overrides.

```ts
global_meta {
  id                 integer  PRIMARY KEY  -- always 1
  site_title         text     NOT NULL
  site_description   text     NOT NULL
  author             text     NOT NULL
  og_site_name       text     NOT NULL
  og_title           text     NOT NULL
  og_description     text     NOT NULL
  og_type            text     NOT NULL DEFAULT 'website'
  og_image_path      text              -- path in /uploads/og/
  twitter_card       text     NOT NULL DEFAULT 'summary_large_image'
  twitter_title      text     NOT NULL
  twitter_description text    NOT NULL
  twitter_image_path text              -- path in /uploads/og/
  updated_at         text     DEFAULT (datetime('now'))
}
```

---

### 3.5 `nav_links`

Controls every link shown in the top navigation and mobile nav. Order is
controlled by `sort_order`.

```ts
nav_links {
  id          integer  PRIMARY KEY AUTOINCREMENT
  label       text     NOT NULL   -- e.g. "What We Do"
  href        text     NOT NULL   -- e.g. "/what-we-do"
  sort_order  integer  NOT NULL   -- 0-based, drives rendering order
  is_visible  integer  NOT NULL DEFAULT 1
  updated_at  text     DEFAULT (datetime('now'))
}
```

Seeded rows (in order):
`Home /`, `About /about`, `What We Do /what-we-do`,
`Gojo Shop /gojo-shop`, `Partnerships /partnerships`, `Contact /contact`

---

### 3.6 `footer_links`

Same idea as nav_links but for the footer "Explore" column.

```ts
footer_links {
  id          integer  PRIMARY KEY AUTOINCREMENT
  label       text     NOT NULL
  href        text     NOT NULL
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.7 `promise_items`

The three "Gojo Promise" cards shown on the home page and Gojo Shop page.

```ts
promise_items {
  id          integer  PRIMARY KEY AUTOINCREMENT
  title       text     NOT NULL   -- "Quality You Can Trust"
  body        text     NOT NULL
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.8 `audiences`

The three audience one-liners shown on the home page.

```ts
audiences {
  id          integer  PRIMARY KEY AUTOINCREMENT
  label       text     NOT NULL   -- "For Customers"
  body        text     NOT NULL
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.9 `capabilities`

The five capability arms. Each has a slug for anchor-linking on `/what-we-do`.

```ts
capabilities {
  id               integer  PRIMARY KEY AUTOINCREMENT
  slug             text     NOT NULL UNIQUE  -- "import-trade"
  title            text     NOT NULL
  short_desc       text     NOT NULL         -- one-line description
  strategic_purpose text    NOT NULL
  sort_order       integer  NOT NULL
  is_visible       integer  NOT NULL DEFAULT 1
  updated_at       text     DEFAULT (datetime('now'))
}
```

---

### 3.10 `capability_functions`

The bullet-point "Key functions" nested inside each capability.

```ts
capability_functions {
  id             integer  PRIMARY KEY AUTOINCREMENT
  capability_id  integer  NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE
  label          text     NOT NULL   -- "International sourcing and supplier vetting"
  sort_order     integer  NOT NULL
}
```

---

### 3.11 `about_blocks`

The four narrative blocks on `/about` (Purpose, Vision, Mission, Philosophy).

```ts
about_blocks {
  id          integer  PRIMARY KEY AUTOINCREMENT
  label       text     NOT NULL   -- "Purpose"
  body        text     NOT NULL
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.12 `founders`

The founders list shown on `/about`.

```ts
founders {
  id          integer  PRIMARY KEY AUTOINCREMENT
  name        text     NOT NULL   -- "Abraham Sisay"
  role        text     NOT NULL   -- "Co-founder"
  bio         text                -- optional long bio (currently unused on site)
  photo_path  text                -- /uploads/founders/[filename]
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.13 `home_sections`

Controls the copy for every named section on the home page that isn't
already covered by another table.

```ts
home_sections {
  id              integer  PRIMARY KEY AUTOINCREMENT
  section_key     text     NOT NULL UNIQUE  -- see keys below
  eyebrow         text
  heading         text
  body            text
  cta_label       text
  cta_href        text
  cta2_label      text
  cta2_href       text
  updated_at      text     DEFAULT (datetime('now'))
}
```

**section_key values (one row per section):**

| section_key | What it controls |
|---|---|
| `hero` | Eyebrow, H1, body, CTA 1 label+href, CTA 2 label+href |
| `tagline_moment` | Large tagline text + subtitle |
| `hub_spoke` | Eyebrow, H2, body paragraph, "Explore" link label+href |
| `promise_section` | Section eyebrow + H2 above the promise cards |
| `audiences_section` | Section eyebrow (if needed) |
| `work_with_us` | Eyebrow, H2, body, Button 1 label+href, Button 2 label+href |
| `capabilities_grid` | Eyebrow above the capability cards grid |

---

### 3.14 `page_meta`

Per-page SEO overrides (title, description, og:title, og:description,
og:url, canonical).

```ts
page_meta {
  id              integer  PRIMARY KEY AUTOINCREMENT
  page_key        text     NOT NULL UNIQUE  -- "home" | "about" | "what-we-do" | ...
  title           text     NOT NULL
  description     text     NOT NULL
  og_title        text     NOT NULL
  og_description  text     NOT NULL
  og_url          text     NOT NULL
  canonical       text     NOT NULL
  updated_at      text     DEFAULT (datetime('now'))
}
```

**page_key values:**
`home`, `about`, `what-we-do`, `gojo-shop`, `partnerships`, `contact`

---

### 3.15 `gojo_shop_page`

All editable content on the `/gojo-shop` route.

```ts
gojo_shop_page {
  id                    integer  PRIMARY KEY  -- always 1
  -- Hero section
  hero_eyebrow          text     NOT NULL
  hero_heading          text     NOT NULL
  hero_body             text     NOT NULL
  hero_cta_label        text     NOT NULL
  -- Stats cards (4 cards, fixed structure)
  stat1_label           text     NOT NULL  -- "Active users"
  stat1_value           text     NOT NULL  -- "20,000+"
  stat2_label           text     NOT NULL  -- "Model"
  stat2_value           text     NOT NULL  -- "Cash on Delivery"
  stat3_label           text     NOT NULL  -- "Type"
  stat3_value           text     NOT NULL  -- "Multi-vendor"
  stat4_label           text     NOT NULL  -- "Market"
  stat4_value           text     NOT NULL  -- "Ethiopia"
  -- Workflow section header
  workflow_eyebrow      text     NOT NULL
  workflow_heading      text     NOT NULL
  -- Promise section header
  promise_eyebrow       text     NOT NULL
  promise_heading       text     NOT NULL
  updated_at            text     DEFAULT (datetime('now'))
}
```

---

### 3.16 `gojo_shop_workflow_images`

The three workflow image cards on the Gojo Shop page.

```ts
gojo_shop_workflow_images {
  id          integer  PRIMARY KEY AUTOINCREMENT
  title       text     NOT NULL   -- "Order flow"
  body        text     NOT NULL
  image_path  text                -- /uploads/gojo-shop/[filename]
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.17 `partnerships_page`

All editable content on `/partnerships`.

```ts
partnerships_page {
  id                        integer  PRIMARY KEY  -- always 1
  -- Header
  header_eyebrow            text     NOT NULL
  header_heading            text     NOT NULL
  header_body               text     NOT NULL
  -- Vendor section header
  vendor_section_eyebrow    text
  vendor_section_heading    text
  -- Evaluation standards section
  standards_eyebrow         text     NOT NULL
  standards_heading         text     NOT NULL
  standards_body            text     NOT NULL
  -- Institutional partners section
  institutional_eyebrow     text     NOT NULL
  institutional_heading     text     NOT NULL
  -- CTA at bottom
  cta_text                  text     NOT NULL
  cta_subtitle              text     NOT NULL
  cta_button_label          text     NOT NULL
  cta_button_href           text     NOT NULL
  updated_at                text     DEFAULT (datetime('now'))
}
```

---

### 3.18 `vendor_value_props`

The three vendor value proposition cards on `/partnerships`.

```ts
vendor_value_props {
  id          integer  PRIMARY KEY AUTOINCREMENT
  title       text     NOT NULL
  body        text     NOT NULL
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.19 `partnership_standards`

The four quality evaluation standards on `/partnerships`.

```ts
partnership_standards {
  id          integer  PRIMARY KEY AUTOINCREMENT
  label       text     NOT NULL
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
}
```

---

### 3.20 `partner_types`

The four institutional partner type cards on `/partnerships`.

```ts
partner_types {
  id          integer  PRIMARY KEY AUTOINCREMENT
  title       text     NOT NULL   -- "Financial institutions"
  example     text                -- "e.g. Siinqee Bank…"
  body        text     NOT NULL
  logo_path   text                -- /uploads/partners/[filename]
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.21 `contact_page`

All editable content on `/contact`.

```ts
contact_page {
  id                      integer  PRIMARY KEY  -- always 1
  -- Header
  header_eyebrow          text     NOT NULL
  header_heading          text     NOT NULL
  header_body             text     NOT NULL
  -- Contact detail labels
  head_office_label       text     NOT NULL DEFAULT 'Head office'
  email_label             text     NOT NULL DEFAULT 'Email'
  platform_label          text     NOT NULL DEFAULT 'Platform'
  -- Form section
  form_note               text                -- small print below Submit
  updated_at              text     DEFAULT (datetime('now'))
}
```

---

### 3.22 `contact_interest_options`

The dropdown options in the contact form.

```ts
contact_interest_options {
  id          integer  PRIMARY KEY AUTOINCREMENT
  label       text     NOT NULL   -- "Partnership"
  sort_order  integer  NOT NULL
  is_visible  integer  NOT NULL DEFAULT 1
}
```

---

### 3.23 `about_page_header`

The header section of `/about` (separate from the `about_blocks` table because
it has a different layout).

```ts
about_page_header {
  id          integer  PRIMARY KEY  -- always 1
  eyebrow     text     NOT NULL
  heading     text     NOT NULL
  body        text     NOT NULL     -- uses company.positioning today
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.24 `what_we_do_page_header`

The header section of `/what-we-do`.

```ts
what_we_do_page_header {
  id          integer  PRIMARY KEY  -- always 1
  eyebrow     text     NOT NULL
  heading     text     NOT NULL
  body        text     NOT NULL
  updated_at  text     DEFAULT (datetime('now'))
}
```

---

### 3.25 `sessions`

Server-side session store for the admin login cookie.

```ts
sessions {
  id          text     PRIMARY KEY            -- random UUID
  user_id     integer  NOT NULL
  expires_at  text     NOT NULL               -- ISO datetime
  created_at  text     DEFAULT (datetime('now'))
}
```

---

## 4. Image Storage Strategy

### Directory Tree

```
public/
└── uploads/
    ├── logo/
    │   ├── logo-primary.svg          # SVG preferred for logo
    │   ├── logo-dark.svg             # Dark-mode variant
    │   ├── favicon.ico
    │   └── og-default.png            # 1200×630 OG image
    │
    ├── gojo-shop/
    │   ├── gojoshop-order-flow.png
    │   ├── gojoshop-vendor-dashboard.png
    │   └── gojoshop-delivery-verification.png
    │
    ├── founders/
    │   ├── abraham-sisay.jpg
    │   ├── negusu-sisay.jpg
    │   └── samson-tesfaye.jpg
    │
    ├── partners/
    │   └── [partner-slug].png        # Logos for institutional partners
    │
    ├── og/
    │   └── og-[page-key].png         # Per-page OG images
    │
    └── general/
        └── [anything-else]
```

### Naming Convention

- Kebab-case filenames only
- Prefix with category: `logo-`, `gojoshop-`, `founder-`, `partner-`, `og-`
- Extension reflects actual format (`.svg`, `.png`, `.jpg`, `.webp`)
- No spaces, no uppercase, no special chars

### Upload Rules

- Max size: **5 MB** per file
- Accepted types: `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`
- Old file is **deleted from disk** when a replacement is uploaded for the same
  slot (logo, founder photo, workflow image)
- General images are never auto-deleted — admin must manually remove from the
  Media Library page

### Server Upload Handler

A single `POST /api/admin/upload` route handles all image uploads:
- Validates content-type and size
- Sanitises filename (slug + timestamp suffix to avoid collisions)
- Writes to the correct `public/uploads/[category]/` subdirectory
- Returns `{ path: "/uploads/[category]/[filename]" }` to store in DB

---

## 5. Authentication

### Design

- **One admin account only.** Hardcoded at seed time, managed via the Settings
  page thereafter.
- **No registration flow.** The `admin_users` table is seeded with a default
  password that must be changed on first login.
- **HTTP-only session cookie** — `gojo_admin_session` — stores a UUID that maps
  to the `sessions` table. Sessions expire after **7 days**.
- **Bcrypt** (`cost = 12`) for password hashing via Bun's built-in
  `Bun.password.hash()` and `Bun.password.verify()`.

### Default Credentials (seed)

```
username: admin
password: ChangeMe123!
```

The admin is redirected to `/admin/settings` on first login if the default
password has not been changed (detected via a `force_password_change` flag in
`admin_users`).

### Auth Middleware

`src/routes/admin/__layout.tsx` reads the session cookie, queries the
`sessions` table, and redirects to `/admin/login` if:
- Cookie is absent or malformed
- Session ID not found in DB
- Session has expired

All `/api/admin/*` server routes share the same session check.

### Logout

`POST /api/admin/logout` deletes the session row and clears the cookie.

---

## 6. API Layer — Server Routes

All routes live under `src/routes/api/admin/`. They are TanStack Start server
routes that return JSON.

> All routes require a valid session cookie. Return `401` otherwise.

### Company & Global

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/company` | Read `company_info` row |
| PUT | `/api/admin/company` | Update `company_info` |
| GET | `/api/admin/meta/global` | Read `global_meta` |
| PUT | `/api/admin/meta/global` | Update `global_meta` |
| GET | `/api/admin/meta/pages` | List all `page_meta` rows |
| PUT | `/api/admin/meta/pages/:key` | Update one page's meta |

### Logo

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/logo` | List all logo rows |
| POST | `/api/admin/logo` | Upload new logo (multipart) |
| PUT | `/api/admin/logo/:id` | Update alt text or active flag |
| DELETE | `/api/admin/logo/:id` | Delete logo file + row |

### Navigation

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/nav` | List nav links (ordered) |
| POST | `/api/admin/nav` | Add nav link |
| PUT | `/api/admin/nav/:id` | Edit label / href / visibility |
| PUT | `/api/admin/nav/reorder` | Update sort_order for all links |
| DELETE | `/api/admin/nav/:id` | Remove nav link |
| GET | `/api/admin/footer-nav` | List footer links |
| POST | `/api/admin/footer-nav` | Add footer link |
| PUT | `/api/admin/footer-nav/:id` | Edit footer link |
| PUT | `/api/admin/footer-nav/reorder` | Reorder footer links |
| DELETE | `/api/admin/footer-nav/:id` | Remove footer link |

### Home Page

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/home/sections` | List all `home_sections` rows |
| PUT | `/api/admin/home/sections/:key` | Update one section |

### About Page

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/about/header` | Read `about_page_header` |
| PUT | `/api/admin/about/header` | Update header |
| GET | `/api/admin/about/blocks` | List `about_blocks` |
| PUT | `/api/admin/about/blocks/:id` | Update one block |
| PUT | `/api/admin/about/blocks/reorder` | Reorder blocks |

### Founders

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/founders` | List founders |
| POST | `/api/admin/founders` | Add founder (with optional photo upload) |
| PUT | `/api/admin/founders/:id` | Update founder text fields |
| POST | `/api/admin/founders/:id/photo` | Upload / replace photo |
| DELETE | `/api/admin/founders/:id/photo` | Remove photo (revert to initials) |
| PUT | `/api/admin/founders/reorder` | Reorder founders |
| DELETE | `/api/admin/founders/:id` | Remove founder |

### Capabilities

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/capabilities` | List capabilities + their functions |
| POST | `/api/admin/capabilities` | Add capability |
| PUT | `/api/admin/capabilities/:id` | Update capability text fields |
| PUT | `/api/admin/capabilities/reorder` | Reorder capabilities |
| DELETE | `/api/admin/capabilities/:id` | Remove capability |
| POST | `/api/admin/capabilities/:id/functions` | Add function bullet |
| PUT | `/api/admin/capabilities/:id/functions/:fid` | Edit function bullet |
| PUT | `/api/admin/capabilities/:id/functions/reorder` | Reorder bullets |
| DELETE | `/api/admin/capabilities/:id/functions/:fid` | Remove bullet |

### Promise Items

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/promise` | List promise items |
| POST | `/api/admin/promise` | Add item |
| PUT | `/api/admin/promise/:id` | Edit item |
| PUT | `/api/admin/promise/reorder` | Reorder items |
| DELETE | `/api/admin/promise/:id` | Remove item |

### Audiences

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/audiences` | List audiences |
| POST | `/api/admin/audiences` | Add audience |
| PUT | `/api/admin/audiences/:id` | Edit audience |
| PUT | `/api/admin/audiences/reorder` | Reorder |
| DELETE | `/api/admin/audiences/:id` | Remove |

### Gojo Shop Page

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/gojo-shop` | Read page data + workflow images |
| PUT | `/api/admin/gojo-shop` | Update page fields |
| GET | `/api/admin/gojo-shop/workflow` | List workflow image rows |
| POST | `/api/admin/gojo-shop/workflow` | Add workflow image (multipart) |
| PUT | `/api/admin/gojo-shop/workflow/:id` | Edit title/body/image |
| PUT | `/api/admin/gojo-shop/workflow/reorder` | Reorder cards |
| DELETE | `/api/admin/gojo-shop/workflow/:id` | Remove card + image file |

### What We Do Page

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/what-we-do/header` | Read page header |
| PUT | `/api/admin/what-we-do/header` | Update page header |

### Partnerships Page

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/partnerships` | Read page data |
| PUT | `/api/admin/partnerships` | Update page fields |
| GET | `/api/admin/partnerships/vendor-props` | List vendor value props |
| POST | `/api/admin/partnerships/vendor-props` | Add prop |
| PUT | `/api/admin/partnerships/vendor-props/:id` | Edit prop |
| PUT | `/api/admin/partnerships/vendor-props/reorder` | Reorder |
| DELETE | `/api/admin/partnerships/vendor-props/:id` | Remove |
| GET | `/api/admin/partnerships/standards` | List standards |
| POST | `/api/admin/partnerships/standards` | Add standard |
| PUT | `/api/admin/partnerships/standards/:id` | Edit |
| PUT | `/api/admin/partnerships/standards/reorder` | Reorder |
| DELETE | `/api/admin/partnerships/standards/:id` | Remove |
| GET | `/api/admin/partnerships/partner-types` | List partner types |
| POST | `/api/admin/partnerships/partner-types` | Add type |
| PUT | `/api/admin/partnerships/partner-types/:id` | Edit (+ logo upload) |
| PUT | `/api/admin/partnerships/partner-types/reorder` | Reorder |
| DELETE | `/api/admin/partnerships/partner-types/:id` | Remove |

### Contact Page

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/contact` | Read page data |
| PUT | `/api/admin/contact` | Update page fields |
| GET | `/api/admin/contact/interests` | List dropdown options |
| POST | `/api/admin/contact/interests` | Add option |
| PUT | `/api/admin/contact/interests/:id` | Edit option |
| PUT | `/api/admin/contact/interests/reorder` | Reorder options |
| DELETE | `/api/admin/contact/interests/:id` | Remove option |

### Media Library

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/media` | List all uploaded files (from disk scan) |
| POST | `/api/admin/media` | Upload to `general/` bucket |
| DELETE | `/api/admin/media` | Delete file by path |

### Auth

| Method | Path | Action |
|---|---|---|
| POST | `/api/admin/login` | Verify credentials, set session cookie |
| POST | `/api/admin/logout` | Clear session cookie + delete row |
| PUT | `/api/admin/settings/password` | Change admin password |

---

## 7. Admin UI — Pages & Forms

All admin pages live under `/admin/*` and share a sidebar layout.

### 7.1 `/admin/login`

- Username + password form
- POST to `/api/admin/login`
- On success redirect to `/admin`
- Shows error message on bad credentials
- No sidebar (public page)

---

### 7.2 `/admin` — Dashboard

Quick-glance overview:

- Company name + last updated timestamp
- Card count summary: capabilities, founders, promise items, partners
- Link shortcuts to each editor section
- "View site ↗" button opens public site in new tab

---

### 7.3 `/admin/logo` — Logo Manager

- Current logo preview (image or text-mark fallback)
- Upload form: choose variant (`primary`, `dark`, `favicon`, `og`), pick file,
  set alt text
- Table of all uploaded logos: preview thumbnail, variant, path, active toggle,
  delete button
- Warning: deleting the active primary logo reverts to text-mark

---

### 7.4 `/admin/company` — Company Info

Single form with all fields from `company_info`:

- Company name
- Short name
- Tagline
- Positioning (large textarea)
- Location
- Shop URL
- Contact email

Save button → `PUT /api/admin/company`

---

### 7.5 `/admin/meta` — SEO & Open Graph

**Tab 1: Global defaults** — all fields from `global_meta` + OG image upload

**Tab 2: Per-page** — table of pages, click to expand inline form with title,
description, og_title, og_description, og_url, canonical

---

### 7.6 `/admin/navigation` — Navigation Editor

Two panels side by side:

**Main Nav:**
- Drag-and-drop sortable list of nav links
- Inline edit for label + href
- Visibility toggle
- Add new link row
- Delete button

**Footer Links:**
- Same UI as main nav

---

### 7.7 `/admin/home` — Home Page Editor

Accordion with one panel per section key:

1. **Hero** — eyebrow, H1, body text, CTA 1 label + href, CTA 2 label + href
2. **Tagline Moment** — tagline text, subtitle text
3. **Hub & Spoke Section** — eyebrow, H2, body, "Explore" link label + href
4. **Promise Section Header** — eyebrow, H2
5. **Work With Us** — eyebrow, H2, body, Button 1 label+href, Button 2 label+href
6. **Capabilities Grid** — eyebrow label above the cards grid

Each panel has a Save button that calls `PUT /api/admin/home/sections/:key`.

---

### 7.8 `/admin/about` — About Page Editor

**Section 1: Page Header**
- Eyebrow, H1, body (currently uses company.positioning)
- Uses `about_page_header` table

**Section 2: About Blocks**
- Drag-to-reorder list of blocks (Purpose, Vision, Mission, Philosophy)
- Each block: label + body textarea + visibility toggle
- Add new block button
- Each block saves independently

**Section 3: Founders Section**
- Eyebrow + H2 labels (stored in a `home_sections`-style row with key
  `about_founders_header`)
- Founders list: drag-to-reorder cards showing photo thumbnail (or initials),
  name, role
- Click a founder card to expand inline editor: name, role, bio textarea, photo
  upload
- Add founder button
- Delete founder button (with confirmation)

---

### 7.9 `/admin/capabilities` — Capabilities Editor

- Drag-to-reorder list of capability cards
- Each card shows: number badge, title, visibility toggle, edit button, delete
  button
- Clicking edit opens `/admin/capabilities/:id`

### `/admin/capabilities/:id`

Full editor for one capability:

- Slug (read-only after creation — changing slug would break anchor links)
- Title
- Short description
- Strategic purpose (textarea)
- Key Functions sub-list:
  - Drag-to-reorder bullet points
  - Inline edit each bullet
  - Add bullet button
  - Delete bullet button
- Visibility toggle
- Save button

---

### 7.10 `/admin/promise` — Gojo Promise Editor

- Drag-to-reorder list of 3 (or more) promise items
- Each item: title + body textarea + visibility toggle
- Add promise item button
- Delete button

---

### 7.11 `/admin/audiences` — Audiences Editor

- Drag-to-reorder list
- Each item: label + body textarea + visibility toggle
- Add / delete

---

### 7.12 `/admin/gojo-shop` — Gojo Shop Page Editor

**Section 1: Hero**
- Eyebrow, H1, body, CTA label (href always goes to `company.shop_url`)

**Section 2: Stats Cards**
- 4 cards in a 2×2 grid, each with: label field + value field

**Section 3: Workflow Section**
- Header eyebrow + heading (text fields)
- Workflow image cards list:
  - Title + body textarea
  - Image upload (replaces the current placeholder)
  - Visibility toggle
  - Drag-to-reorder
  - Add / delete card

**Section 4: Promise Section**
- Eyebrow + heading text (the promise items themselves are edited on
  `/admin/promise`)

---

### 7.13 `/admin/what-we-do` — What We Do Page Editor

- Page header: eyebrow, H1, body
- Note: capability content is edited on `/admin/capabilities`

---

### 7.14 `/admin/partnerships` — Partnerships Page Editor

**Section 1: Page Header** — eyebrow, H1, body

**Section 2: Vendor Value Props** — drag-to-reorder, title + body, add/delete

**Section 3: Evaluation Standards**
- Header: eyebrow, H2, body
- Standards list: drag-to-reorder, inline edit each bullet, add/delete

**Section 4: Institutional Partners**
- Header: eyebrow, H2
- Partner type cards: title, example text, body, logo upload, reorder, add/delete

**Section 5: CTA Block** — text, subtitle, button label + href

---

### 7.15 `/admin/contact` — Contact Page Editor

**Section 1: Page Header** — eyebrow, H1, body

**Section 2: Contact Detail Labels** — editable labels for "Head office",
"Email", "Platform" (values come from `company_info`)

**Section 3: Form Options** — drag-to-reorder list of interest dropdown options,
add/delete, visibility toggle

**Section 4: Form Note** — small print below the Submit button

---

### 7.16 `/admin/media` — Image Library

- Grid of thumbnail cards showing every file in `public/uploads/`
- Grouped by subfolder (Logo, Gojo Shop, Founders, Partners, OG, General)
- Each card: filename, dimensions (read from file), file size, copy-path button,
  delete button
- Upload to General bucket: drag-and-drop or file picker

---

### 7.17 `/admin/settings` — Admin Account

- Current username (read-only)
- Change password form: current password, new password, confirm new password
- POST to `PUT /api/admin/settings/password`
- On first login with default password: banner warning to change password

---

## 8. Public Site Integration

### How public routes get content

Each public route file currently imports from `src/lib/content.ts`. After
implementation, each route will use a TanStack Start `loader` (already
supported by the framework) to fetch content from Drizzle:

```ts
// src/routes/index.tsx (simplified)
export const Route = createFileRoute('/')({
  loader: async () => {
    const company = await db.query.companyInfo.findFirst()
    const heroSection = await db.query.homeSections.findFirst({
      where: eq(homeSections.sectionKey, 'hero')
    })
    const promiseItems = await db.query.promiseItems.findMany({
      where: eq(promiseItems.isVisible, 1),
      orderBy: asc(promiseItems.sortOrder)
    })
    // ... etc
    return { company, heroSection, promiseItems, ... }
  },
  component: HomePage,
})
```

The component then reads from `Route.useLoaderData()` instead of the
static `content.ts` import.

### `content.ts` — kept as seed source only

`src/lib/content.ts` is NOT deleted. The seed script (`db/seed.ts`) reads it
and inserts all values into SQLite on first run. After that, `content.ts` is
not imported by any route.

### Fallback behaviour

If the DB has not been seeded yet (e.g. fresh clone), every loader catches
the error and falls back to `content.ts` values, so the site never shows
blank content.

---

## 9. Content Map — Every Field Made Dynamic

This section traces every hardcoded string in the codebase to its DB location.

### `src/lib/content.ts`

| Field | DB Table | Column |
|---|---|---|
| `company.name` | `company_info` | `name` |
| `company.shortName` | `company_info` | `short_name` |
| `company.tagline` | `company_info` | `tagline` |
| `company.positioning` | `company_info` | `positioning` |
| `company.location` | `company_info` | `location` |
| `company.shopUrl` | `company_info` | `shop_url` |
| `company.contactEmail` | `company_info` | `contact_email` |
| `promise[0..2].title` | `promise_items` | `title` |
| `promise[0..2].body` | `promise_items` | `body` |
| `audiences[0..2].label` | `audiences` | `label` |
| `audiences[0..2].body` | `audiences` | `body` |
| `capabilities[0..4].slug` | `capabilities` | `slug` |
| `capabilities[0..4].title` | `capabilities` | `title` |
| `capabilities[0..4].short` | `capabilities` | `short_desc` |
| `capabilities[0..4].keyFunctions[]` | `capability_functions` | `label` |
| `capabilities[0..4].strategicPurpose` | `capabilities` | `strategic_purpose` |

### `src/routes/__root.tsx`

| Content | DB Table | Column |
|---|---|---|
| Default `<title>` | `global_meta` | `site_title` |
| Default meta description | `global_meta` | `site_description` |
| `author` meta | `global_meta` | `author` |
| `og:site_name` | `global_meta` | `og_site_name` |
| `og:title` | `global_meta` | `og_title` |
| `og:description` | `global_meta` | `og_description` |
| `og:type` | `global_meta` | `og_type` |
| `og:image` URL | `global_meta` | `og_image_path` |
| `twitter:card` | `global_meta` | `twitter_card` |
| `twitter:title` | `global_meta` | `twitter_title` |
| `twitter:description` | `global_meta` | `twitter_description` |
| `twitter:image` URL | `global_meta` | `twitter_image_path` |
| 404 eyebrow "404" | `page_meta` (static) | — (keep hardcoded) |
| 404 H1 "Page not found" | static | — |
| 404 body text | static | — |
| Error page texts | static | — |

### `src/components/site-chrome.tsx`

| Content | DB Table | Column |
|---|---|---|
| Logo image / text mark | `logo` | `file_path`, `is_active` |
| "Gojo Solutions" + "PLC" text | `company_info` | `short_name` |
| Nav link labels + hrefs | `nav_links` | `label`, `href` |
| "Visit Gojo Shop →" button label | `home_sections` | `cta_label` (key: `nav_cta`) |
| Footer company positioning | `company_info` | `positioning` |
| Footer "Explore" links | `footer_links` | `label`, `href` |
| Footer location | `company_info` | `location` |
| Footer email | `company_info` | `contact_email` |
| Footer platform URL display text | `company_info` | `shop_url` |
| Footer copyright year | auto (current year) | — |

### `src/routes/index.tsx`

| Content | DB Table | Column |
|---|---|---|
| Hero eyebrow | `home_sections` (key: `hero`) | `eyebrow` |
| Hero H1 | `home_sections` | `heading` |
| Hero body | `home_sections` | `body` |
| "Visit Gojo Shop ↗" label | `home_sections` | `cta_label` |
| "Partner with us" label | `home_sections` | `cta2_label` |
| "Partner with us" href | `home_sections` | `cta2_href` |
| Promise figure caption | static or `home_sections` | `body` (key: `promise_figure`) |
| Tagline text | `home_sections` (key: `tagline_moment`) | `heading` |
| "Our operating philosophy…" | `home_sections` | `body` |
| Hub/Spoke eyebrow "Structure" | `home_sections` (key: `hub_spoke`) | `eyebrow` |
| Hub/Spoke H2 | `home_sections` | `heading` |
| Hub/Spoke body paragraph | `home_sections` | `body` |
| "Explore what we do →" | `home_sections` | `cta_label` + `cta_href` |
| Promise section eyebrow | `home_sections` (key: `promise_section`) | `eyebrow` |
| Promise section H2 | `home_sections` | `heading` |
| Promise items | `promise_items` | all columns |
| Audiences items | `audiences` | all columns |
| "Work with us" eyebrow | `home_sections` (key: `work_with_us`) | `eyebrow` |
| "Work with us" H2 | `home_sections` | `heading` |
| "Work with us" body | `home_sections` | `body` |
| "Partnerships" button | `home_sections` | `cta_label` + `cta_href` |
| "Contact us" button | `home_sections` | `cta2_label` + `cta2_href` |
| "Capabilities at a glance" eyebrow | `home_sections` (key: `capabilities_grid`) | `eyebrow` |
| Capability cards data | `capabilities` | all columns |
| Schema.org org name | `company_info` | `name` |
| Schema.org org url | `company_info` | `shop_url` |
| Schema.org founder names | `founders` | `name` |
| Schema.org address locality | `company_info` | `location` |

### `src/routes/about.tsx`

| Content | DB Table | Column |
|---|---|---|
| Page `<title>` | `page_meta` (key: `about`) | `title` |
| Meta description | `page_meta` | `description` |
| og:title | `page_meta` | `og_title` |
| og:description | `page_meta` | `og_description` |
| og:url | `page_meta` | `og_url` |
| Canonical | `page_meta` | `canonical` |
| Header eyebrow "About" | `about_page_header` | `eyebrow` |
| Header H1 | `about_page_header` | `heading` |
| Header body | `about_page_header` | `body` |
| "Purpose" label | `about_blocks` | `label` |
| "Purpose" body | `about_blocks` | `body` |
| "Vision" label | `about_blocks` | `label` |
| "Vision" body | `about_blocks` | `body` |
| "Mission" label | `about_blocks` | `label` |
| "Mission" body | `about_blocks` | `body` |
| "Corporate philosophy" label | `about_blocks` | `label` |
| "Corporate philosophy" body | `about_blocks` | `body` |
| Founders eyebrow | `home_sections` (key: `about_founders_header`) | `eyebrow` |
| "Three founders…" H2 | `home_sections` | `heading` |
| Founder names | `founders` | `name` |
| Founder roles | `founders` | `role` |
| Founder photos | `founders` | `photo_path` |

### `src/routes/what-we-do.tsx`

| Content | DB Table | Column |
|---|---|---|
| Page meta (all) | `page_meta` (key: `what-we-do`) | all |
| Header eyebrow | `what_we_do_page_header` | `eyebrow` |
| Header H1 | `what_we_do_page_header` | `heading` |
| Header body | `what_we_do_page_header` | `body` |
| Capabilities detail cards | `capabilities` + `capability_functions` | all |
| "Capability [n]" numbering | auto-generated from sort_order | — |

### `src/routes/gojo-shop.tsx`

| Content | DB Table | Column |
|---|---|---|
| Page meta (all) | `page_meta` (key: `gojo-shop`) | all |
| Hero eyebrow | `gojo_shop_page` | `hero_eyebrow` |
| Hero H1 | `gojo_shop_page` | `hero_heading` |
| Hero body | `gojo_shop_page` | `hero_body` |
| "Open gojoshop.et ↗" label | `gojo_shop_page` | `hero_cta_label` |
| Stat 1 label "Active users" | `gojo_shop_page` | `stat1_label` |
| Stat 1 value "20,000+" | `gojo_shop_page` | `stat1_value` |
| Stat 2 label "Model" | `gojo_shop_page` | `stat2_label` |
| Stat 2 value "Cash on Delivery" | `gojo_shop_page` | `stat2_value` |
| Stat 3 label "Type" | `gojo_shop_page` | `stat3_label` |
| Stat 3 value "Multi-vendor" | `gojo_shop_page` | `stat3_value` |
| Stat 4 label "Market" | `gojo_shop_page` | `stat4_label` |
| Stat 4 value "Ethiopia" | `gojo_shop_page` | `stat4_value` |
| Workflow eyebrow | `gojo_shop_page` | `workflow_eyebrow` |
| Workflow H2 | `gojo_shop_page` | `workflow_heading` |
| Workflow image titles | `gojo_shop_workflow_images` | `title` |
| Workflow image bodies | `gojo_shop_workflow_images` | `body` |
| Workflow image paths | `gojo_shop_workflow_images` | `image_path` |
| Promise eyebrow | `gojo_shop_page` | `promise_eyebrow` |
| Promise H2 | `gojo_shop_page` | `promise_heading` |
| Promise items | `promise_items` | all |

### `src/routes/partnerships.tsx`

| Content | DB Table | Column |
|---|---|---|
| Page meta (all) | `page_meta` (key: `partnerships`) | all |
| Header eyebrow | `partnerships_page` | `header_eyebrow` |
| Header H1 | `partnerships_page` | `header_heading` |
| Header body | `partnerships_page` | `header_body` |
| Vendor section heading | `partnerships_page` | `vendor_section_heading` |
| Vendor value prop titles | `vendor_value_props` | `title` |
| Vendor value prop bodies | `vendor_value_props` | `body` |
| Standards eyebrow | `partnerships_page` | `standards_eyebrow` |
| Standards H2 | `partnerships_page` | `standards_heading` |
| Standards body | `partnerships_page` | `standards_body` |
| Standards list items | `partnership_standards` | `label` |
| Institutional eyebrow | `partnerships_page` | `institutional_eyebrow` |
| Institutional H2 | `partnerships_page` | `institutional_heading` |
| Partner type titles | `partner_types` | `title` |
| Partner type examples | `partner_types` | `example` |
| Partner type bodies | `partner_types` | `body` |
| Partner type logos | `partner_types` | `logo_path` |
| CTA text | `partnerships_page` | `cta_text` |
| CTA subtitle | `partnerships_page` | `cta_subtitle` |
| CTA button label | `partnerships_page` | `cta_button_label` |
| CTA button href | `partnerships_page` | `cta_button_href` |

### `src/routes/contact.tsx`

| Content | DB Table | Column |
|---|---|---|
| Page meta (all) | `page_meta` (key: `contact`) | all |
| Header eyebrow | `contact_page` | `header_eyebrow` |
| Header H1 | `contact_page` | `header_heading` |
| Header body | `contact_page` | `header_body` |
| "Head office" label | `contact_page` | `head_office_label` |
| Head office value | `company_info` | `location` |
| "Email" label | `contact_page` | `email_label` |
| Email value | `company_info` | `contact_email` |
| "Platform" label | `contact_page` | `platform_label` |
| Platform URL | `company_info` | `shop_url` |
| Interest dropdown options | `contact_interest_options` | `label` |
| Form note | `contact_page` | `form_note` |

### `src/components/hub-spoke.tsx`

| Content | DB Table | Column |
|---|---|---|
| Central hub "Gojo Shop" label | `company_info` | `short_name` (first word) |
| Satellite node titles | `capabilities` | `title` |
| aria-label | `what_we_do_page_header` | generated from heading |

### `src/routes/sitemap[.]xml.ts`

All paths are generated dynamically from `nav_links` + capability slugs.
Priorities and changefreqs stay as constants (or can be added to `page_meta`).

---

## 10. Implementation Phases

### Phase 1 — Foundation

1. Install Drizzle ORM and `better-sqlite3` (or use `bun:sqlite` directly)
2. Write `db/schema.ts` — all 25 tables
3. Write `db/client.ts` — singleton connection + `gojo.db` file in project root
4. Run Drizzle `generate` + `migrate`
5. Write `db/seed.ts` — reads `content.ts`, inserts all values
6. Run seed: `bun db/seed.ts`

### Phase 2 — Auth

7. Write `src/lib/session.server.ts` — sign/verify session cookie, CRUD on `sessions`
8. Create `src/routes/admin/login.tsx` — login form + `POST /api/admin/login`
9. Create `src/routes/admin/__layout.tsx` — session check, redirect guard, sidebar
10. Create `POST /api/admin/logout`
11. Test login / logout cycle

### Phase 3 — Company & Global Editors

12. `GET/PUT /api/admin/company` + `/admin/company` editor page
13. `GET/PUT /api/admin/meta/global` + `/admin/meta` page (tab 1)
14. `GET/PUT /api/admin/meta/pages/:key` + `/admin/meta` page (tab 2)
15. `GET/PUT /api/admin/nav` (+ reorder + footer) + `/admin/navigation` page

### Phase 4 — Image Upload Infrastructure

16. `POST /api/admin/upload` — multipart handler, disk writer, sanitiser
17. Create `public/uploads/` subdirectories
18. `src/components/admin/image-upload.tsx` — reusable upload widget
19. Test with a logo upload

### Phase 5 — Logo

20. `GET/POST/PUT/DELETE /api/admin/logo`
21. `/admin/logo` page
22. Modify `site-chrome.tsx` to query `logo` table via loader

### Phase 6 — Home Page Content

23. `GET/PUT /api/admin/home/sections/:key` for all 7 section keys
24. `/admin/home` accordion page

### Phase 7 — About Page

25. `about_page_header` endpoints + editor
26. `about_blocks` endpoints + editor (drag-to-reorder)
27. `founders` endpoints (incl. photo upload) + editor

### Phase 8 — Capabilities

28. `capabilities` CRUD + reorder endpoints
29. `capability_functions` CRUD + reorder endpoints
30. `/admin/capabilities` list page
31. `/admin/capabilities/:id` detail editor

### Phase 9 — Promise, Audiences

32. `promise_items` endpoints + `/admin/promise`
33. `audiences` endpoints + `/admin/audiences`

### Phase 10 — Gojo Shop Page

34. `gojo_shop_page` endpoints + editor (hero, stats, workflow header, promise header)
35. `gojo_shop_workflow_images` endpoints (incl. image upload) + editor

### Phase 11 — Partnerships Page

36. `partnerships_page` endpoints + all sub-list endpoints
37. `/admin/partnerships` full page editor

### Phase 12 — Contact Page

38. `contact_page` + `contact_interest_options` endpoints
39. `/admin/contact` editor

### Phase 13 — Public Route Integration

40. Add loaders to every public route file (replace `content.ts` imports)
41. Update `site-chrome.tsx` loader
42. Update `hub-spoke.tsx` to receive data as props from route
43. Update `__root.tsx` global meta loader
44. Update `sitemap[.]xml.ts`

### Phase 14 — Media Library & Settings

45. `GET/POST/DELETE /api/admin/media`
46. `/admin/media` grid page
47. `/admin/settings` password change form

### Phase 15 — QA & Hardening

48. Test every admin form end to end
49. Verify all public pages render from DB (not `content.ts`)
50. Verify fallback to `content.ts` on empty DB
51. Test image upload, replacement, and deletion
52. Test session expiry + redirect
53. Test drag-to-reorder on all lists

---

## 11. File-by-File Change Summary

| File | Action | Reason |
|---|---|---|
| `db/schema.ts` | **CREATE** | All 25 table definitions |
| `db/client.ts` | **CREATE** | Drizzle + SQLite singleton |
| `db/seed.ts` | **CREATE** | Populates DB from content.ts |
| `db/migrations/` | **CREATE** | Auto-generated by Drizzle |
| `public/uploads/` | **CREATE** | Image storage root |
| `src/lib/db.server.ts` | **CREATE** | Re-exports Drizzle client |
| `src/lib/session.server.ts` | **CREATE** | Cookie session helpers |
| `src/lib/content.ts` | **NO CHANGE** | Kept as seed source + fallback |
| `src/routes/__root.tsx` | **MODIFY** | Add global meta loader from DB |
| `src/routes/index.tsx` | **MODIFY** | Replace imports with DB loader |
| `src/routes/about.tsx` | **MODIFY** | Replace imports with DB loader |
| `src/routes/what-we-do.tsx` | **MODIFY** | Replace imports with DB loader |
| `src/routes/gojo-shop.tsx` | **MODIFY** | Replace imports with DB loader |
| `src/routes/partnerships.tsx` | **MODIFY** | Replace imports with DB loader |
| `src/routes/contact.tsx` | **MODIFY** | Replace imports with DB loader |
| `src/routes/sitemap[.]xml.ts` | **MODIFY** | Dynamic from nav_links table |
| `src/routes/api/admin/*.ts` | **CREATE** (35+ files) | All API endpoints |
| `src/routes/admin/*.tsx` | **CREATE** (17 files) | All admin UI pages |
| `src/components/site-chrome.tsx` | **MODIFY** | Logo + nav from DB via props |
| `src/components/hub-spoke.tsx` | **MODIFY** | Accept capability data as prop |
| `src/components/admin/` | **CREATE** | Sidebar, image-upload, etc. |
| `package.json` | **MODIFY** | Add drizzle-orm, bcrypt deps |

---

*End of plan. Awaiting approval before any code is written.*
