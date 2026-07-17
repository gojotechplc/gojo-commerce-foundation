import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { HubSpokeDiagram } from "@/components/hub-spoke";
import { getHomePageFn } from "@/lib/public.server";

export const Route = createFileRoute("/")({
  loader: () => getHomePageFn(),
  head: ({ loaderData }) => {
    const meta = loaderData?.meta;
    const company = loaderData?.chrome.company;
    return {
      meta: [
        ...(meta
          ? [
              { title: meta.title },
              { name: "description", content: meta.description },
              { property: "og:title", content: meta.ogTitle },
              { property: "og:description", content: meta.ogDescription },
              { property: "og:url", content: meta.ogUrl },
            ]
          : [{ property: "og:url", content: "/" }, { property: "og:type", content: "website" }]),
      ],
      links: [{ rel: "canonical", href: meta?.canonical ?? "/" }],
      scripts: company
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: company.name,
                url: company.shopUrl,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Addis Ababa",
                  addressCountry: "ET",
                },
                founder: (loaderData?.founders ?? []).map((f) => ({
                  "@type": "Person",
                  name: f.name,
                })),
              }),
            },
          ]
        : [],
    };
  },
  component: Home,
});

function Home() {
  const data = Route.useLoaderData();
  const { chrome, sections, promise, audiences, capabilities } = data;
  const company = chrome.company;
  const hero = sections.hero as
    | {
        eyebrow?: string | null;
        heading?: string | null;
        body?: string | null;
        ctaLabel?: string | null;
        ctaHref?: string | null;
        cta2Label?: string | null;
        cta2Href?: string | null;
      }
    | undefined;
  const tagline = sections.tagline_moment as
    | { heading?: string | null; body?: string | null }
    | undefined;
  const hub = sections.hub_spoke as
    | {
        eyebrow?: string | null;
        heading?: string | null;
        body?: string | null;
        ctaLabel?: string | null;
        ctaHref?: string | null;
      }
    | undefined;
  const promiseSection = sections.promise_section as
    | { eyebrow?: string | null; heading?: string | null }
    | undefined;
  const work = sections.work_with_us as
    | {
        eyebrow?: string | null;
        heading?: string | null;
        body?: string | null;
        ctaLabel?: string | null;
        ctaHref?: string | null;
        cta2Label?: string | null;
        cta2Href?: string | null;
      }
    | undefined;
  const capsGrid = sections.capabilities_grid as { eyebrow?: string | null } | undefined;
  const figure = sections.promise_figure as
    | { eyebrow?: string | null; heading?: string | null; body?: string | null }
    | undefined;

  const heroHeading = hero?.heading ?? "Trust-driven commerce infrastructure for Ethiopia.";
  const figureLines = (figure?.heading ?? "Quality you can trust.\nPrices that make sense.\nDelivery you can rely on.").split(
    "\n",
  );
  const hubHeading = (hub?.heading ?? "One core engine.\nFive supporting capabilities.").split("\n");

  return (
    <PageShell chrome={chrome}>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 500px at 20% 0%, color-mix(in oklab, var(--forest-deep) 10%, transparent), transparent 60%), radial-gradient(800px 400px at 90% 20%, color-mix(in oklab, var(--ochre) 14%, transparent), transparent 70%)",
          }}
        />
        <div className="container-page pt-20 pb-16 md:pt-28 md:pb-24 grid gap-12 md:grid-cols-[1.15fr_1fr] items-center">
          <div>
            <div className="eyebrow rule-ochre">
              {hero?.eyebrow ?? "Gojo Solutions PLC · Addis Ababa"}
            </div>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-foreground">
              {heroHeading.includes("infrastructure") ? (
                <>
                  {heroHeading.split("infrastructure")[0]}
                  <span className="text-forest-deep">infrastructure</span>
                  {heroHeading.split("infrastructure")[1]}
                </>
              ) : (
                heroHeading
              )}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              {hero?.body ?? company.positioning}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={hero?.ctaHref || company.shopUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-forest transition-colors"
              >
                {hero?.ctaLabel ?? "Visit Gojo Shop"} <span aria-hidden>↗</span>
              </a>
              <Link
                to={(hero?.cta2Href as "/") || "/contact"}
                className="inline-flex items-center gap-2 rounded-sm border border-primary/25 px-5 py-3 text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-colors"
              >
                {hero?.cta2Label ?? "Partner with us"}
              </Link>
            </div>
          </div>

          <figure className="relative">
            <div className="aspect-[4/5] rounded-md overflow-hidden bg-gradient-to-br from-primary via-forest to-primary/85 relative">
              <div
                aria-hidden
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 30%, var(--ochre) 0%, transparent 45%)",
                }}
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-primary-foreground">
                <div className="eyebrow text-primary-foreground/70">
                  {figure?.eyebrow ?? "The Gojo Promise"}
                </div>
                <div>
                  {figureLines.map((line, i) => (
                    <div
                      key={i}
                      className={`font-display text-3xl leading-tight ${
                        i === 1
                          ? "text-primary-foreground/85"
                          : i === 2
                            ? "text-primary-foreground/70"
                            : ""
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <figcaption className="sr-only">
              {figure?.body ?? "The three pillars of the Gojo Promise."}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-y border-border/60 bg-primary text-primary-foreground">
        <div className="container-page py-10 md:py-14 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div className="font-display text-2xl md:text-4xl leading-tight max-w-3xl">
            {(tagline?.heading ?? "Identify the problem. Build the solution. Execute now.")
              .split(". ")
              .map((part, i, arr) => {
                const text = part + (i < arr.length - 1 ? ". " : "");
                if (i === 1)
                  return (
                    <span key={i} className="text-primary-foreground/75">
                      {text}
                    </span>
                  );
                if (i === 2)
                  return (
                    <span key={i} className="text-accent">
                      {text}
                    </span>
                  );
                return <span key={i}>{text}</span>;
              })}
          </div>
          <div className="text-sm text-primary-foreground/70 md:text-right md:max-w-xs">
            {tagline?.body ?? "Our operating philosophy — not a slogan."}
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] items-center">
          <div>
            <div className="eyebrow rule-ochre">{hub?.eyebrow ?? "Structure"}</div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              {hubHeading.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < hubHeading.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              {hub?.body ??
                "Gojo Shop is the platform 20,000+ Ethiopian customers already use. Around it, five specialist arms of Gojo Solutions handle the upstream and downstream work that makes it dependable — from import and logistics to digital infrastructure and market development."}
            </p>
            <Link
              to={(hub?.ctaHref as "/what-we-do") || "/what-we-do"}
              className="mt-6 inline-flex items-center gap-1.5 text-primary font-medium hover:text-forest"
            >
              {hub?.ctaLabel ?? "Explore what we do →"}
            </Link>
          </div>
          <HubSpokeDiagram capabilities={capabilities} />
        </div>
      </section>

      <section className="bg-secondary/60 border-y border-border/60">
        <div className="container-page py-20 md:py-24">
          <div className="max-w-2xl">
            <div className="eyebrow rule-ochre">
              {promiseSection?.eyebrow ?? "The Gojo Promise"}
            </div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              {promiseSection?.heading ?? "A promise, held together by three commitments."}
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {promise.map((p) => (
              <article
                key={p.id ?? p.title}
                className="rounded-md bg-card border border-border/70 p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-xl">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {audiences.map((a) => (
            <div key={a.id ?? a.label} className="border-t border-primary/25 pt-6">
              <div className="eyebrow">{a.label}</div>
              <p className="mt-3 font-display text-xl leading-snug text-foreground">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="rounded-md border border-primary/20 bg-card p-8 md:p-12 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <div className="eyebrow rule-ochre">{work?.eyebrow ?? "Work with us"}</div>
            <h2 className="mt-4 font-display text-3xl">
              {work?.heading ?? "Build the next layer of Ethiopian commerce with us."}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg">
              {work?.body ??
                "Whether you're a vendor, a logistics operator, a bank, or an international supplier — we're building the infrastructure alongside you."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to={(work?.ctaHref as "/partnerships") || "/partnerships"}
              className="inline-flex items-center rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-forest"
            >
              {work?.ctaLabel ?? "Partnerships"}
            </Link>
            <Link
              to={(work?.cta2Href as "/contact") || "/contact"}
              className="inline-flex items-center rounded-sm border border-primary/30 px-5 py-3 text-sm font-medium text-foreground hover:bg-primary/5"
            >
              {work?.cta2Label ?? "Contact us"}
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <div className="eyebrow">{capsGrid?.eyebrow ?? "Capabilities at a glance"}</div>
          <div className="mt-6 grid gap-px bg-border rounded-md overflow-hidden border border-border md:grid-cols-3">
            {capabilities.map((c) => (
              <Link
                key={c.slug}
                to="/capabilities/$slug"
                params={{ slug: c.slug }}
                className="relative bg-card p-6 block group overflow-hidden transition-all duration-300 hover:bg-secondary/60 hover:-translate-y-0.5 hover:z-10 hover:shadow-[0_12px_28px_-16px_rgba(0,62,21,0.35)]"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-0 bg-accent transition-all duration-300 group-hover:w-1"
                />
                <div className="font-display text-lg leading-snug transition-colors duration-300 group-hover:text-primary">
                  {c.title}
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3 transition-colors duration-300 group-hover:text-foreground/75">
                  {c.short}
                </p>
                <div className="mt-3 text-xs font-medium text-primary inline-flex items-center gap-1 translate-x-0 transition-transform duration-300 group-hover:translate-x-1">
                  Open page <span aria-hidden>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
