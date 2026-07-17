import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { HubSpokeDiagram } from "@/components/hub-spoke";
import { company, promise, audiences, capabilities } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
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
          founder: company.founders.map((f) => ({ "@type": "Person", name: f.name })),
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      {/* Hero */}
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
            <div className="eyebrow rule-ochre">Gojo Solutions PLC · Addis Ababa</div>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-foreground">
              Trust-driven commerce{" "}
              <span className="text-forest-deep">infrastructure</span> for Ethiopia.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              {company.positioning}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={company.shopUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-forest transition-colors"
              >
                Visit Gojo Shop <span aria-hidden>↗</span>
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-sm border border-primary/25 px-5 py-3 text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-colors"
              >
                Partner with us
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
                <div className="eyebrow text-primary-foreground/70">The Gojo Promise</div>
                <div>
                  <div className="font-display text-3xl leading-tight">
                    Quality you can trust.
                  </div>
                  <div className="font-display text-3xl leading-tight text-primary-foreground/85">
                    Prices that make sense.
                  </div>
                  <div className="font-display text-3xl leading-tight text-primary-foreground/70">
                    Delivery you can rely on.
                  </div>
                </div>
              </div>
            </div>
            <figcaption className="sr-only">
              The three pillars of the Gojo Promise.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Tagline moment */}
      <section className="border-y border-border/60 bg-primary text-primary-foreground">
        <div className="container-page py-10 md:py-14 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div className="font-display text-2xl md:text-4xl leading-tight max-w-3xl">
            Identify the problem.{" "}
            <span className="text-primary-foreground/75">Build the solution.</span>{" "}
            <span className="text-accent">Execute now.</span>
          </div>
          <div className="text-sm text-primary-foreground/70 md:text-right md:max-w-xs">
            Our operating philosophy — not a slogan.
          </div>
        </div>
      </section>

      {/* Hub and spoke */}
      <section className="container-page py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] items-center">
          <div>
            <div className="eyebrow rule-ochre">Structure</div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              One core engine.<br />
              Five supporting capabilities.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Gojo Shop is the platform 20,000+ Ethiopian customers already use. Around
              it, five specialist arms of Gojo Solutions handle the upstream and
              downstream work that makes it dependable — from import and logistics to
              digital infrastructure and market development.
            </p>
            <Link
              to="/what-we-do"
              className="mt-6 inline-flex items-center gap-1.5 text-primary font-medium hover:text-forest"
            >
              Explore what we do →
            </Link>
          </div>
          <HubSpokeDiagram />
        </div>
      </section>

      {/* The Gojo Promise */}
      <section className="bg-secondary/60 border-y border-border/60">
        <div className="container-page py-20 md:py-24">
          <div className="max-w-2xl">
            <div className="eyebrow rule-ochre">The Gojo Promise</div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              A promise, held together by three commitments.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {promise.map((p) => (
              <article
                key={p.title}
                className="rounded-md bg-card border border-border/70 p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-xl">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="container-page py-20 md:py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {audiences.map((a) => (
            <div key={a.label} className="border-t border-primary/25 pt-6">
              <div className="eyebrow">{a.label}</div>
              <p className="mt-3 font-display text-xl leading-snug text-foreground">
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section className="container-page pb-24">
        <div className="rounded-md border border-primary/20 bg-card p-8 md:p-12 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <div className="eyebrow rule-ochre">Work with us</div>
            <h2 className="mt-4 font-display text-3xl">
              Build the next layer of Ethiopian commerce with us.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg">
              Whether you're a vendor, a logistics operator, a bank, or an
              international supplier — we're building the infrastructure alongside you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to="/partnerships"
              className="inline-flex items-center rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-forest"
            >
              Partnerships
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-sm border border-primary/30 px-5 py-3 text-sm font-medium text-foreground hover:bg-primary/5"
            >
              Contact us
            </Link>
          </div>
        </div>

        {/* Capability quick grid */}
        <div className="mt-16">
          <div className="eyebrow">Capabilities at a glance</div>
          <div className="mt-6 grid gap-px bg-border rounded-md overflow-hidden border border-border md:grid-cols-3">
            {capabilities.map((c) => (
              <Link
                key={c.slug}
                to="/what-we-do"
                hash={c.slug}
                className="bg-card p-6 hover:bg-secondary/50 transition-colors"
              >
                <div className="font-display text-lg leading-snug">{c.title}</div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                  {c.short}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
