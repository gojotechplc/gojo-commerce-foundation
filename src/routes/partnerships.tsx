import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { getPartnershipsPageFn } from "@/lib/public.server";

export const Route = createFileRoute("/partnerships")({
  loader: () => getPartnershipsPageFn(),
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
        : [{ title: "Partnerships & Vendors — Gojo Solutions PLC" }],
      links: [{ rel: "canonical", href: meta?.canonical ?? "/partnerships" }],
    };
  },
  component: Partnerships,
});

function Partnerships() {
  const { chrome, page, vendorProps, standards, partners } = Route.useLoaderData();

  return (
    <PageShell chrome={chrome}>
      <section className="container-page pt-20 pb-12 grid gap-10 md:grid-cols-[1.15fr_0.85fr] items-center">
        <div>
          <div className="eyebrow rule-ochre">
            {page?.headerEyebrow ?? "Partnerships & vendors"}
          </div>
          <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl">
            {page?.headerHeading ?? "We build alongside partners who take trust seriously."}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {page?.headerBody ??
              "Gojo Solutions works with vendors, banks, logistics operators, and international suppliers to build commerce infrastructure at national scale."}
          </p>
        </div>
        {page?.heroImagePath ? (
          <figure className="relative">
            <img
              src={page.heroImagePath}
              alt=""
              className="aspect-[4/5] w-full rounded-md object-cover border border-border"
            />
          </figure>
        ) : (
          <div
            aria-hidden
            className="aspect-[4/5] rounded-md bg-gradient-to-br from-primary via-forest to-primary/80 hidden md:block"
          />
        )}
      </section>

      <section className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="eyebrow">{page?.vendorSectionEyebrow ?? "For vendors"}</div>
            <h2 className="mt-3 font-display text-3xl leading-tight">
              {page?.vendorSectionHeading ?? "Sell on infrastructure, not just a marketplace."}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {vendorProps.map((v) => (
              <div key={v.id} className="rounded-md border border-border bg-card p-6">
                <div className="font-display text-lg leading-snug">{v.title}</div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/60 border-y border-border/60 mt-8">
        <div className="container-page py-16 grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="eyebrow rule-ochre">
              {page?.standardsEyebrow ?? "Evaluation standards"}
            </div>
            <h2 className="mt-4 font-display text-3xl">
              {page?.standardsHeading ?? "Quality accountability, held in writing."}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {page?.standardsBody ??
                "Every vendor on Gojo Shop meets — and continues to meet — a defined standard."}
            </p>
          </div>
          <ul className="space-y-4">
            {standards.map((s, i) => (
              <li
                key={s.id}
                className="flex gap-4 border-b border-border/70 pb-4 last:border-0"
              >
                <span className="font-display text-2xl text-accent leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground leading-relaxed">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="max-w-2xl">
          <div className="eyebrow rule-ochre">
            {page?.institutionalEyebrow ?? "International & institutional"}
          </div>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            {page?.institutionalHeading ?? "Who we partner with beyond the storefront."}
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {partners.map((p) => (
            <article key={p.id} className="rounded-md border border-border bg-card p-6">
              {p.logoPath && (
                <div className="mb-4 h-12 flex items-center">
                  <img
                    src={p.logoPath}
                    alt=""
                    className="max-h-10 max-w-[180px] object-contain"
                  />
                </div>
              )}
              <div className="font-display text-xl">{p.title}</div>
              {p.example && (
                <div className="mt-1 text-xs text-muted-foreground italic">{p.example}</div>
              )}
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-md bg-primary text-primary-foreground p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-lg">
            <div className="font-display text-2xl">
              {page?.ctaText ?? "Start a conversation with the partnerships team."}
            </div>
            <p className="mt-2 text-sm text-primary-foreground/80">
              {page?.ctaSubtitle ??
                "Tell us who you are and what you're building. We'll come back within a few business days."}
            </p>
          </div>
          <Link
            to="/contact"
            search={{ interest: "Partnership", source: "partnerships" }}
            className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            {page?.ctaButtonLabel ?? "Contact partnerships →"}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
