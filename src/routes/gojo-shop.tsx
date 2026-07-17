import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/site-chrome";
import { ImageLightbox } from "@/components/image-lightbox";
import { getGojoShopPageFn } from "@/lib/public.server";

const GALLERY_PAGE_SIZE = 6;

export const Route = createFileRoute("/gojo-shop")({
  loader: () => getGojoShopPageFn(),
  head: ({ loaderData }) => {
    const meta = loaderData?.meta;
    return {
      meta: meta
        ? [
            { title: meta.title },
            { name: "description", content: meta.description },
            { property: "og:title", content: meta.ogTitle },
            { property: "og:description", content: meta.ogDescription },
            { property: "og:url", content: meta.ogUrl },
          ]
        : [{ title: "Gojo Shop — The core engine of Gojo Solutions PLC" }],
      links: [{ rel: "canonical", href: meta?.canonical ?? "/gojo-shop" }],
    };
  },
  component: GojoShop,
});

function GojoShop() {
  const { chrome, page, workflows, gallery, promise } = Route.useLoaderData();
  const company = chrome.company;
  const stats = [
    {
      label: page?.stat1Label ?? "Active users",
      value: page?.stat1Value ?? "20,000+",
      accent: "primary" as const,
    },
    {
      label: page?.stat2Label ?? "Model",
      value: page?.stat2Value ?? "Cash on Delivery",
      accent: "card" as const,
    },
    {
      label: page?.stat3Label ?? "Type",
      value: page?.stat3Value ?? "Multi-vendor",
      accent: "card" as const,
    },
    {
      label: page?.stat4Label ?? "Market",
      value: page?.stat4Value ?? "Ethiopia",
      accent: "accent" as const,
    },
  ];

  const [pageIndex, setPageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(gallery.length / GALLERY_PAGE_SIZE));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const pageItems = useMemo(() => {
    const start = safePage * GALLERY_PAGE_SIZE;
    return gallery.slice(start, start + GALLERY_PAGE_SIZE);
  }, [gallery, safePage]);

  const lightboxItems = gallery.map((g) => ({
    id: g.id,
    src: g.imagePath,
    title: g.title,
    caption: g.caption,
  }));

  return (
    <PageShell chrome={chrome}>
      <section className="container-page pt-20 pb-12 grid gap-12 md:grid-cols-[1.15fr_1fr] items-end">
        <div>
          <div className="eyebrow rule-ochre">{page?.heroEyebrow ?? "Core engine"}</div>
          <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-6xl leading-[1.05] text-balance">
            {page?.heroHeading ?? "Gojo Shop is where the promise ships."}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            {page?.heroBody ??
              "Gojo Shop is Ethiopia's trust-driven multi-vendor commerce platform — 20,000+ users, Cash-on-Delivery by default, and vendors held to a standard of quality accountability."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={company.shopUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-forest"
            >
              {page?.heroCtaLabel ?? "Open gojoshop.et ↗"}
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className={
                s.accent === "primary"
                  ? "rounded-md bg-primary text-primary-foreground p-6"
                  : s.accent === "accent"
                    ? "rounded-md bg-accent text-accent-foreground p-6"
                    : "rounded-md bg-card border border-border p-6"
              }
            >
              <dt
                className={`eyebrow ${
                  s.accent === "primary"
                    ? "text-primary-foreground/70"
                    : s.accent === "accent"
                      ? "text-accent-foreground/70"
                      : ""
                }`}
              >
                {s.label}
              </dt>
              <dd
                className={`mt-2 font-display ${
                  s.accent === "primary" ? "text-4xl" : "text-2xl leading-tight"
                }`}
              >
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page py-16">
        <div className="max-w-2xl">
          <div className="eyebrow rule-ochre">
            {page?.workflowEyebrow ?? "Inside the platform"}
          </div>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            {page?.workflowHeading ?? "How Gojo Shop works, end to end."}
          </h2>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {workflows.map((w) => (
            <figure key={w.id} className="flex flex-col">
              {w.imagePath ? (
                <img
                  src={w.imagePath}
                  alt={w.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-md object-cover border border-border"
                />
              ) : (
                <div className="aspect-[4/3] rounded-md border border-dashed border-primary/30 bg-secondary/60 grid place-items-center p-6 text-center">
                  <div>
                    <div className="eyebrow">[PLACEHOLDER IMAGE]</div>
                    <div className="mt-2 text-sm text-muted-foreground">Upload in admin</div>
                  </div>
                </div>
              )}
              <figcaption className="mt-4">
                <div className="font-display text-lg">{w.title}</div>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{w.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="container-page py-16 border-t border-border/60">
          <div className="max-w-2xl">
            <div className="eyebrow rule-ochre">{page?.galleryEyebrow ?? "Gallery"}</div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              {page?.galleryHeading ?? "A closer look at Gojo Shop."}
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((g, i) => {
              const absoluteIndex = safePage * GALLERY_PAGE_SIZE + i;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setLightboxIndex(absoluteIndex)}
                  className="group text-left rounded-md overflow-hidden border border-border bg-card hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <img
                    src={g.imagePath}
                    alt={g.title || "Gojo Shop"}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  {(g.title || g.caption) && (
                    <div className="p-3">
                      {g.title && <div className="font-display text-base">{g.title}</div>}
                      {g.caption && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {g.caption}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Page {safePage + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-sm border border-border px-3 py-1.5 disabled:opacity-40"
                  disabled={safePage <= 0}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="rounded-sm border border-border px-3 py-1.5 disabled:opacity-40"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="bg-primary text-primary-foreground border-y border-border/60">
        <div className="container-page py-20">
          <div className="max-w-2xl">
            <div className="eyebrow text-primary-foreground/70 rule-ochre">
              {page?.promiseEyebrow ?? "The Gojo Promise, on the platform"}
            </div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              {page?.promiseHeading ??
                "What every Gojo Shop transaction is engineered to guarantee."}
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {promise.map((p) => (
              <div
                key={p.id}
                className="rounded-md border border-primary-foreground/15 bg-primary-foreground/5 p-6"
              >
                <div className="font-display text-xl">{p.title}</div>
                <p className="mt-3 text-sm text-primary-foreground/80 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ImageLightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={() =>
          setLightboxIndex((i) =>
            i === null ? null : (i - 1 + lightboxItems.length) % lightboxItems.length,
          )
        }
        onNext={() =>
          setLightboxIndex((i) => (i === null ? null : (i + 1) % lightboxItems.length))
        }
      />
    </PageShell>
  );
}
