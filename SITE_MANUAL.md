# Gojo Solutions website — usage manual

How to run the site, edit content in admin, and what each change updates on the public pages.

---

## 1. Quick start

| Action | Where |
|--------|--------|
| Public site | `/` (e.g. `http://localhost:8080`) |
| Admin login | `/admin/login` |
| Default login | `admin` / `ChangeMe123!` (you must change password on first login) |

Run locally with Bun:

```bash
bun install
bun run dev
```

Content and images live in:

- `data/gojo.db` — all text, settings, message inbox
- `public/uploads/` — all uploaded images

Keep both folders when you deploy.

---

## 2. Admin sidebar map

Dashboard sits alone at the top. Everything else is grouped and starts collapsed.

| Group | Items | What they control |
|-------|--------|-------------------|
| **Inbox** | Messages | Contact & partnership form submissions |
| **Brand & site** | Company, Logo, Navigation, SEO / Meta, Media | Global chrome: name, logo, nav links, social meta, file browser |
| **Pages** | Home, About, What We Do, Capabilities, Gojo Shop, Partnerships, Contact | Full page copy + page-specific media |
| **Shared content** | Founders, Promise, Audiences | Blocks reused on Home / About |
| **Account** | Settings | Admin password |

**View site** and **Log out** stay fixed at the bottom of the sidebar.

---

## 3. Public pages → what to edit

### Home `/`

| What you see | Edit in admin |
|--------------|---------------|
| Headline, CTAs, **full-bleed landscape hero photo** | **Pages → Home → `hero`** (wide/landscape image works best) |
| Green tagline strip | **Home → `tagline_moment`** |
| “One core engine…” + diagram *or* photo | **Home → `hub_spoke`** (optional image replaces diagram) |
| Full-width photo band | **Home → `mid_band`** (only shows if an image is uploaded) |
| Promise cards | **Shared content → Promise** (+ section titles in **Home → `promise_section`**) |
| Audience lines | **Shared content → Audiences** |
| Work with us + optional image | **Home → `work_with_us`** |
| Capabilities grid (+ card photos) | **Pages → Capabilities** (card image) + **Home → `capabilities_grid`** label |
| Nav “Visit Gojo Shop” button | **Home → `nav_cta`** |

### About `/about`

| What you see | Edit in admin |
|--------------|---------------|
| Page header | **Pages → About** |
| Story blocks | **Pages → About** (blocks list) |
| Founders | **Shared content → Founders** |

### What We Do `/what-we-do`

| What you see | Edit in admin |
|--------------|---------------|
| Header | **Pages → What We Do** |
| Capability list / links | **Pages → Capabilities** |

### Capability detail `/capabilities/[slug]`

| What you see | Edit in admin |
|--------------|---------------|
| Full page (copy, hero, card image, key functions, SEO) | **Pages → Capabilities → Edit** |

### Gojo Shop `/gojo-shop`

| What you see | Edit in admin |
|--------------|---------------|
| Hero + stats + section headings | **Pages → Gojo Shop** (top form) |
| Three workflow cards | **Gojo Shop → Workflow cards** (upload / **replace** / **remove** image per card) |
| Gallery (6 per page, click opens lightbox) | **Gojo Shop → Gallery** (add / replace / remove / reorder) |
| Promise strip at bottom | **Shared content → Promise** + Gojo Shop promise headings |

### Partnerships `/partnerships`

| What you see | Edit in admin |
|--------------|---------------|
| Headline + **hero photo** | **Pages → Partnerships → Hero image** + page copy form |
| Vendor value props | **Partnerships → Vendor value props** |
| Standards list | **Partnerships → Standards** (text only — no photos by design) |
| Partner type cards + logos | **Partnerships → partner types** (upload / replace / remove logo) |
| Bottom CTA → Contact | Opens `/contact` with Partnership interest |

### Contact `/contact`

| What you see | Edit in admin |
|--------------|---------------|
| Page copy, labels, phone display | **Pages → Contact** |
| Interest dropdown options | **Contact → Interest options** |
| Submitted messages | **Inbox → Messages** |

Form submissions are saved in the database (not mailto). Partnership CTA pre-fills interest and tags source as partnerships.

---

## 4. Brand & site (global)

| Task | Where | Effect |
|------|--------|--------|
| Company name, email, shop URL, location | **Brand → Company** | Header text, footer, contact details, CTAs |
| Site logo | **Brand → Company → Site logo** *or* **Logo** | Header + footer logo (Media library alone does **not** set the live logo) |
| Menu links | **Brand → Navigation** | Header + footer links |
| Browser title / social share images | **Brand → SEO / Meta** | `<title>`, Open Graph, Twitter cards |
| Browse/delete upload files | **Brand → Media** | Files on disk only; wire them via the page editors |

---

## 5. Messages inbox

1. Visitor submits **Contact** (or Partnership → Contact).
2. Message appears under **Inbox → Messages**.
3. Unread count shows on the sidebar badge and Dashboard.
4. Open a message to mark it read; reply via your email client; filter by date / source / read status; **Clear matching** deletes only the filtered set.

---

## 6. Image guidelines (recommended)

| Page | Include | Skip |
|------|---------|------|
| Home | Hero, optional mid-band, capability cards | Don’t put a photo in every section |
| Gojo Shop | Workflow screenshots + gallery of real ops | Avoid huge uncompressed files |
| Partnerships | **1 hero** (real partnership/logistics) + **partner logos** | No stock handshakes; no photos in Standards |
| Capabilities | Hero + optional card image per capability | — |
| Contact | No decorative gallery needed | — |

Rules for all uploads: max **5 MB**; PNG / JPEG / WebP / SVG (ICO for favicon).

---

## 7. What happens when you save

1. You edit in `/admin` and click Save / upload.
2. Data is written to SQLite (`data/gojo.db`) and/or a file under `public/uploads/…`.
3. Public pages load that data on each visit (refresh the public tab after editing).
4. If no DB row exists yet, seed/fallback copy from `src/lib/content.ts` may show until you save once.

---

## 8. Deploy checklist

1. `bun install` → `bun run build` → `bun run start` (Bun required).
2. Persist `data/` and `public/uploads/`.
3. Change the default admin password.
4. Set `GOJO_SITE_URL` for correct sitemap URLs if needed.

---

## 9. Common “why didn’t it update?” cases

| Symptom | Likely cause |
|---------|----------------|
| Logo not on site | Uploaded only in Media — use **Company → Site logo** or **Logo** with **primary** active |
| Hero image missing | Wrong section (e.g. Media instead of **Home → hero** / **Partnerships → Hero**) |
| Gallery empty on Gojo Shop | Images not marked Visible, or none uploaded under Gallery |
| Mid-band not on Home | **mid_band** needs an uploaded image; text alone won’t show the band |
| Contact form “does nothing” | Check **Messages**; ensure you’re not blocked by email validation / rate limit |
| Edit capability does nothing | Use list **Edit** (opens `/admin/capabilities/:id`) |

For install and env vars, see [README.md](./README.md).
