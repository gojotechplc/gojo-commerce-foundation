import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { HubSpokeDiagram } from "@/components/hub-spoke";
import { capabilities } from "@/lib/content";

export const Route = createFileRoute("/what-we-do")({
  head: () => ({
    meta: [
      { title: "What We Do — Gojo Solutions PLC" },
      {
        name: "description",
        content:
          "Five capability arms supporting one core engine: import & trade, digital platform, logistics & fulfillment, investment & consulting, and marketing & market development.",
      },
      { property: "og:title", content: "What We Do — Gojo Solutions PLC" },
      {
        property: "og:description",
        content:
          "The five capability arms of Gojo Solutions PLC, and how each one strengthens Gojo Shop.",
      },
      { property: "og:url", content: "/what-we-do" },
    ],
    links: [{ rel: "canonical", href: "/what-we-do" }],
  }),
  component: WhatWeDo,
});

function WhatWeDo() {
  return (
    <PageShell>
      <section className="container-page pt-20 pb-10">
        <div className="eyebrow rule-ochre">What we do</div>
        <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl">
          Five capabilities. One purpose: make commerce work.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Each arm of Gojo Solutions exists to remove a specific point of friction in
          Ethiopian commerce. Together, they make Gojo Shop possible — and make it
          repeatable for partners who plug in.
        </p>
      </section>

      <section className="container-page py-8">
        <HubSpokeDiagram />
      </section>

      <section className="container-page py-16">
        <div className="space-y-16">
          {capabilities.map((c, i) => (
            <article
              key={c.slug}
              id={c.slug}
              className="grid gap-8 md:grid-cols-[1fr_1.4fr] scroll-mt-24"
            >
              <div>
                <div className="eyebrow text-accent-foreground/70">
                  Capability {String(i + 1).padStart(2, "0")}
                </div>
                <h2 className="mt-3 font-display text-3xl leading-tight">{c.title}</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">{c.short}</p>
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
