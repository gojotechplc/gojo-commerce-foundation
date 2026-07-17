# Gojo Solutions PLC — Corporate Website

Corporate website for Gojo Solutions PLC (Addis Ababa), the parent company of
Gojo Shop (gojoshop.et). Built with TanStack Start + Tailwind v4.

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (preferred) — the lockfile is `bun.lock`
- Node.js v20+ (if you prefer npm/pnpm)

#### Install Bun (if not already installed)

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.zshrc   # or restart your terminal
```

### Install dependencies

```bash
bun install
```

### Run the dev server

```bash
bun run dev
```

The app starts at **http://localhost:5173** (Vite will pick the next available
port if 5173 is in use — check your terminal output).

### Other commands

| Command | Description |
|---|---|
| `bun run build` | Production build |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

## Editing copy

All company-facing copy lives in **`src/lib/content.ts`** — company facts, the
Gojo Promise, the audience one-liners, and the five capability arms (key
functions + strategic purpose). Edit that file rather than the pages.

Per-page long-form copy that isn't shared lives at the top of each route file
under `src/routes/`:

- `src/routes/index.tsx` — home
- `src/routes/about.tsx` — purpose, vision, mission, corporate philosophy, founders
- `src/routes/what-we-do.tsx` — the five capabilities (data comes from `content.ts`)
- `src/routes/gojo-shop.tsx` — the core engine
- `src/routes/partnerships.tsx` — vendors + institutional partners
- `src/routes/contact.tsx` — contact form

## Adding real images

The Gojo Shop workflow page currently renders `[PLACEHOLDER IMAGE]` blocks for:

- `gojoshop-order-flow.png`
- `gojoshop-vendor-dashboard.png`
- `gojoshop-delivery-verification.png`

To drop in real images:

1. Save the files under `public/images/` using those exact filenames (or edit
   the `workflowImages` array in `src/routes/gojo-shop.tsx` to match your names).
2. Replace the placeholder `<div>` inside each `<figure>` with:

   ```tsx
   <img
     src={`/images/${w.file}`}
     alt={w.title}
     loading="lazy"
     className="aspect-[4/3] w-full rounded-md object-cover border border-border"
   />
   ```

3. Keep `alt` text descriptive — do not leave empty alts on workflow diagrams.

Filename convention: kebab-case, prefix with `gojoshop-` for shop screens,
`gojo-` for parent-company assets.

## Contact form

The form on `/contact` currently opens the visitor's email client via a
`mailto:` link. To wire it to a backend:

- Change the `<form action={mailto}>` to point at a POST endpoint (a TanStack
  Start server route under `src/routes/api/`, a serverless function, or your
  existing backend).
- Remove `encType="text/plain"` and send JSON.
- Keep `info@gojosolutions.et` (in `src/lib/content.ts`) as the destination
  address until a dedicated intake mailbox is set up.

## Design system

Anchored on the brand deep green `#003E15`, warmed with an Ethiopian-inflected
ochre and cream background. Do **not** override colors with hardcoded Tailwind
classes (`bg-white`, `text-black`, arbitrary hex). Use the semantic tokens
defined in `src/styles.css`:

- `bg-primary` / `text-primary` — deep green
- `bg-accent` / `text-accent` — ochre
- `bg-background` / `text-foreground` — cream / ink
- `bg-secondary`, `bg-muted`, `border-border`
- `font-display` (Fraunces) for headings, `font-sans` (Inter) for body

Utility classes worth knowing: `.container-page`, `.eyebrow`, `.rule-ochre`.

## Real data placeholders

Every metric on the site is either from the brief (20,000+ Gojo Shop users) or
clearly labeled `[PLACEHOLDER]`. Don't invent client logos, press mentions, or
partnership names — swap them in only when confirmed.
