import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { HubSpokeDiagram } from "@/components/hub-spoke";
import { getWhatWeDoPageFn } from "@/lib/public.server";

export const Route = createFileRoute("/what-we-do")({
  loader: () => getWhatWeDoPageFn(),
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
        : [{ title: "What We Do — Gojo Solutions PLC" }],
      links: [{ rel: "canonical", href: meta?.canonical ?? "/what-we-do" }],
    };
  },
  component: WhatWeDo,
});

function WhatWeDo() {
  const { chrome, header, capabilities } = Route.useLoaderData();

  return (
    <PageShell chrome={chrome}>
      <section className="container-page pt-20 pb-10">
        <div className="eyebrow rule-ochre">{header?.eyebrow ?? "What we do"}</div>
        <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-6xl leading-[1.05] max-w-3xl text-balance">
          {header?.heading ?? "Five capabilities. One purpose: make commerce work."}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {header?.body ??
            "Each arm of Gojo Solutions exists to remove a specific point of friction in Ethiopian commerce. Together, they make Gojo Shop possible — and make it repeatable for partners who plug in."}
        </p>
      </section>

      <section className="container-page py-8">
        <HubSpokeDiagram capabilities={capabilities} />
      </section>

      <section className="container-page py-16">
        <div className="space-y-16">
          {capabilities.map((c, i) => (
            <article
              key={c.slug}
              id={c.slug}
              className="grid gap-8 md:grid-cols-[1fr_1.4fr] scroll-mt-header"
            >
              <div>
                <div className="eyebrow text-accent-foreground/70">
                  Capability {String(i + 1).padStart(2, "0")}
                </div>
                <h2 className="mt-3 font-display text-3xl leading-tight">{c.title}</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">{c.short}</p>
                <Link
                  to="/capabilities/$slug"
                  params={{ slug: c.slug }}
                  className="mt-5 inline-flex text-sm font-medium text-primary hover:text-forest"
                >
                  Open full page →
                </Link>
              </div>
              <div className="border-l-2 border-primary/20 pl-6 md:pl-10">
                <div className="eyebrow">Key functions</div>
                <ul className="mt-3 space-y-2 text-foreground">
                  {c.keyFunctions.map((k) => (
                    <li key={k} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"
                      />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 eyebrow">Strategic purpose</div>
                <p className="mt-2 font-display text-lg text-foreground leading-snug">
                  {c.strategicPurpose}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
