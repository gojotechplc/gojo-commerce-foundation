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

function isSectionVisible(section: { isVisible?: number | null } | undefined | null) {
  // Missing row or null isVisible → treat as visible (migration default).
  return !section || section.isVisible !== 0;
}

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
        imagePath?: string | null;
        isVisible?: number | null;
      }
    | undefined;
  const tagline = sections.tagline_moment as
    | { heading?: string | null; body?: string | null; isVisible?: number | null }
    | undefined;
  const hub = sections.hub_spoke as
    | {
        eyebrow?: string | null;
        heading?: string | null;
        body?: string | null;
        ctaLabel?: string | null;
        ctaHref?: string | null;
        imagePath?: string | null;
        isVisible?: number | null;
      }
    | undefined;
  const midBand = sections.mid_band as
    | {
        eyebrow?: string | null;
        heading?: string | null;
        body?: string | null;
        imagePath?: string | null;
        isVisible?: number | null;
      }
    | undefined;
  const promiseSection = sections.promise_section as
    | { eyebrow?: string | null; heading?: string | null; isVisible?: number | null }
    | undefined;
  const audiencesSection = sections.audiences_section as
    | { isVisible?: number | null }
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
        imagePath?: string | null;
        isVisible?: number | null;
      }
    | undefined;
  const capsGrid = sections.capabilities_grid as
    | { eyebrow?: string | null; isVisible?: number | null }
    | undefined;
  const figure = sections.promise_figure as
    | {
        eyebrow?: string | null;
        heading?: string | null;
        body?: string | null;
        isVisible?: number | null;
      }
    | undefined;

  const showHero = isSectionVisible(hero);
  const showTagline = isSectionVisible(tagline);
  const showHub = isSectionVisible(hub);
  const showMidBand = isSectionVisible(midBand) && Boolean(midBand?.imagePath);
  const showPromise = isSectionVisible(promiseSection);
  const showAudiences = isSectionVisible(audiencesSection);
  const showWork = isSectionVisible(work);
  const showCaps = isSectionVisible(capsGrid);
  const showFigure = isSectionVisible(figure);

  const heroHeading = hero?.heading ?? "Trust-driven commerce infrastructure for Ethiopia.";
  const figureLines = (
    figure?.heading ?? "Quality you can trust.\nPrices that make sense.\nDelivery you can rely on."
  ).split("\n");
  const hubHeading = (hub?.heading ?? "One core engine.\nFive supporting capabilities.").split(
    "\n",
  );

  return (
    <PageShell chrome={chrome}>
      {showHero && (
        <section className="relative isolate min-h-[min(78dvh,720px)] sm:min-h-[min(86vh,880px)] flex items-end overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 -z-10">
            {hero?.imagePath ? (
              <img
                src={hero.imagePath}
                alt=""
                className="h-full w-full object-cover scale-105 animate-[hero-zoom_18s_ease-out_forwards]"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background:
                    "radial-gradient(1200px 600px at 70% 40%, color-mix(in oklab, var(--ochre) 28%, transparent), transparent 55%), linear-gradient(135deg, var(--forest-deep) 0%, var(--primary) 45%, color-mix(in oklab, var(--forest) 80%, black) 100%)",
                }}
              />
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/25 md:to-transparent"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-primary/35"
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />
          </div>

          <div className="container-page relative w-full pt-20 pb-10 sm:pt-28 sm:pb-14 md:pt-36 md:pb-20 lg:pb-24">
            <div className="max-w-2xl lg:max-w-3xl">
              <div className="eyebrow text-primary-foreground/70 rule-ochre animate-[hero-rise_0.7s_ease-out_both]">
                {hero?.eyebrow ?? "Gojo Solutions PLC · Addis Ababa"}
              </div>
              <h1 className="mt-4 sm:mt-5 md:mt-6 font-display text-[1.85rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.05] tracking-tight text-balance animate-[hero-rise_0.8s_ease-out_0.08s_both]">
                {heroHeading.includes("infrastructure") ? (
                  <>
                    {heroHeading.split("infrastructure")[0]}
                    <span className="text-accent">infrastructure</span>
                    {heroHeading.split("infrastructure")[1]}
                  </>
                ) : (
                  heroHeading
                )}
              </h1>
              <p className="mt-5 md:mt-6 text-base md:text-lg text-primary-foreground/80 max-w-xl leading-relaxed animate-[hero-rise_0.8s_ease-out_0.16s_both]">
                {hero?.body ?? company.positioning}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 animate-[hero-rise_0.8s_ease-out_0.24s_both]">
                <a
                  href={hero?.ctaHref || company.shopUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
                >
                  {hero?.ctaLabel ?? "Visit Gojo Shop"} <span aria-hidden>↗</span>
                </a>
                <Link
                  to={(hero?.cta2Href as "/") || "/contact"}
                  className="inline-flex items-center gap-2 rounded-sm border border-primary-foreground/30 bg-primary-foreground/5 px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 transition-colors backdrop-blur-sm"
                >
                  {hero?.cta2Label ?? "Partner with us"}
                </Link>
              </div>
            </div>

            {showFigure && (figure?.eyebrow || figureLines.length > 0) && (
              <div className="mt-12 md:mt-16 pt-6 border-t border-primary-foreground/15 max-w-3xl animate-[hero-rise_0.9s_ease-out_0.32s_both]">
                <div className="eyebrow text-primary-foreground/55">
                  {figure?.eyebrow ?? "The Gojo Promise"}
                </div>
                <p className="mt-2 font-display text-lg md:text-xl text-primary-foreground/85 leading-snug">
                  {figureLines.filter(Boolean).join(" · ")}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {showTagline && (
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
      )}

      {showHub && (
        <section className="container-page py-14 sm:py-20 md:py-28">
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
            {hub?.imagePath ? (
              <img
                src={hub.imagePath}
                alt=""
                className="w-full aspect-[4/3] rounded-md object-cover border border-border"
              />
            ) : (
              <HubSpokeDiagram capabilities={capabilities} />
            )}
          </div>
        </section>
      )}

      {showMidBand && midBand?.imagePath && (
        <section className="relative overflow-hidden border-y border-border/60">
          <img
            src={midBand.imagePath}
            alt={midBand.heading || ""}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="relative container-page py-14 sm:py-20 md:py-28 text-primary-foreground max-w-3xl">
            {midBand.eyebrow && (
              <div className="eyebrow text-primary-foreground/70 rule-ochre">{midBand.eyebrow}</div>
            )}
            {midBand.heading && (
              <h2 className="mt-4 font-display text-3xl md:text-4xl">{midBand.heading}</h2>
            )}
            {midBand.body && (
              <p className="mt-4 text-primary-foreground/85 max-w-xl leading-relaxed">
                {midBand.body}
              </p>
            )}
          </div>
        </section>
      )}

      {showPromise && (
        <section className="bg-secondary/60 border-y border-border/60">
          <div className="container-page py-14 sm:py-20 md:py-24">
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
      )}

      {showAudiences && (
        <section className="container-page py-14 sm:py-20 md:py-24">
          <div className="grid gap-10 md:grid-cols-3">
            {audiences.map((a) => (
              <div key={a.id ?? a.label} className="border-t border-primary/25 pt-6">
                <div className="eyebrow">{a.label}</div>
                <p className="mt-3 font-display text-xl leading-snug text-foreground">{a.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(showWork || showCaps) && (
        <section className="container-page pb-16 sm:pb-24">
          {showWork && (
            <div className="rounded-md border border-primary/20 bg-card p-6 sm:p-8 md:p-12 grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="eyebrow rule-ochre">{work?.eyebrow ?? "Work with us"}</div>
                <h2 className="mt-4 font-display text-3xl">
                  {work?.heading ?? "Build the next layer of Ethiopian commerce with us."}
                </h2>
                <p className="mt-4 text-muted-foreground max-w-lg">
                  {work?.body ??
                    "Whether you're a vendor, a logistics operator, a bank, or an international supplier — we're building the infrastructure alongside you."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
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
              {work?.imagePath && (
                <img
                  src={work.imagePath}
                  alt=""
                  className="w-full aspect-[4/3] rounded-md object-cover border border-border"
                />
              )}
            </div>
          )}

          {showCaps && (
            <div className={showWork ? "mt-16" : ""}>
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
                    {c.cardImagePath && (
                      <img
                        src={c.cardImagePath}
                        alt=""
                        className="mb-4 h-28 w-full rounded-sm object-cover border border-border/60"
                      />
                    )}
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
          )}
        </section>
      )}
    </PageShell>
  );
}
