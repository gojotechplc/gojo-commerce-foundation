import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { getCapabilityPageFn } from "@/lib/public.server";

export const Route = createFileRoute("/capabilities/$slug")({
  loader: async ({ params }) => {
    const data = await getCapabilityPageFn({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const c = loaderData?.capability;
    if (!c) return {};
    const title = c.metaTitle || `${c.title} — Gojo Solutions PLC`;
    const description = c.metaDescription || c.shortDesc;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/capabilities/${c.slug}` },
        ...(c.heroImagePath
          ? [{ property: "og:image", content: c.heroImagePath }]
          : []),
      ],
      links: [{ rel: "canonical", href: `/capabilities/${c.slug}` }],
    };
  },
  component: CapabilityPage,
});

function paragraphs(text: string | null | undefined) {
  if (!text?.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function CapabilityPage() {
  const { chrome, capability: c, siblings } = Route.useLoaderData();
  const bodyParas = paragraphs(c.body);
  const purposeParas = paragraphs(c.strategicPurpose);

  return (
    <PageShell chrome={chrome}>
      <section className="container-page pt-16 pb-10">
        <Link
          to="/what-we-do"
          className="text-sm text-primary hover:text-forest"
        >
          ← What we do
        </Link>
        <div className="eyebrow rule-ochre mt-6">{c.pageEyebrow ?? "Capability"}</div>
        <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl">
          {c.title}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {c.shortDesc}
        </p>
      </section>

      {c.heroImagePath && (
        <section className="container-page pb-12">
          <img
            src={c.heroImagePath}
            alt={c.title}
            className="w-full max-h-[28rem] object-cover rounded-md border border-border"
          />
        </section>
      )}

      <section className="container-page py-12 grid gap-12 md:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="eyebrow">Strategic purpose</div>
          <div className="mt-4 space-y-4">
            {purposeParas.map((p, i) => (
              <p key={i} className="font-display text-xl leading-snug text-foreground whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </div>
        <div>
          <div className="eyebrow">Key functions</div>
          <ul className="mt-4 space-y-3">
            {c.keyFunctions.map((k) => (
              <li key={k} className="flex gap-3 border-b border-border/60 pb-3 last:border-0">
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
                />
                <span className="text-foreground leading-relaxed">{k}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {bodyParas.length > 0 && (
        <section className="bg-secondary/50 border-y border-border/60">
          <div className="container-page py-16 max-w-3xl">
            <div className="eyebrow rule-ochre">Overview</div>
            <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed text-base md:text-lg">
              {bodyParas.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {siblings.length > 1 && (
        <section className="container-page py-16">
          <div className="eyebrow">Other capabilities</div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {siblings
              .filter((s) => s.slug !== c.slug)
              .map((s) => (
                <Link
                  key={s.slug}
                  to="/capabilities/$slug"
                  params={{ slug: s.slug }}
                  className="rounded-md border border-border bg-card p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="font-display text-lg">{s.title}</div>
                  <div className="mt-1 text-xs text-primary">Read more →</div>
                </Link>
              ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
