import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { ensureSeeded, getDb } from "@/lib/db.server";
import { capabilities, navLinks } from "../../db/schema";

const BASE_URL = process.env.GOJO_SITE_URL?.replace(/\/$/, "") ?? "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let paths = ["/", "/about", "/what-we-do", "/gojo-shop", "/partnerships", "/contact"];
        try {
          await ensureSeeded();
          const db = getDb();
          const rows = db
            .select()
            .from(navLinks)
            .where(eq(navLinks.isVisible, 1))
            .orderBy(asc(navLinks.sortOrder))
            .all();
          if (rows.length) {
            paths = rows.map((r) => r.href);
          }
          const caps = db
            .select({ slug: capabilities.slug })
            .from(capabilities)
            .where(eq(capabilities.isVisible, 1))
            .all();
          for (const c of caps) {
            paths.push(`/capabilities/${c.slug}`);
          }
        } catch {
          // fall back to defaults
        }

        const urls = paths.map((path, i) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${path}</loc>`,
            `    <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>`,
            `    <priority>${path === "/" ? "1.0" : i < 3 ? "0.9" : "0.7"}</priority>`,
            `  </url>`,
          ].join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
