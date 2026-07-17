import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { getGojoShopPageFn } from "@/lib/public.server";

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
  const { chrome, page, workflows, promise } = Route.useLoaderData();
  const company = chrome.company;
  const stats = [
    { label: page?.stat1Label ?? "Active users", value: page?.stat1Value ?? "20,000+", accent: "primary" as const },
    { label: page?.stat2Label ?? "Model", value: page?.stat2Value ?? "Cash on Delivery", accent: "card" as const },
    { label: page?.stat3Label ?? "Type", value: page?.stat3Value ?? "Multi-vendor", accent: "card" as const },
    { label: page?.stat4Label ?? "Market", value: page?.stat4Value ?? "Ethiopia", accent: "accent" as const },
  ];

  return (
    <PageShell chrome={chrome}>
      <section className="container-page pt-20 pb-12 grid gap-12 md:grid-cols-[1.15fr_1fr] items-end">
        <div>
          <div className="eyebrow rule-ochre">{page?.heroEyebrow ?? "Core engine"}</div>
          <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05]">
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
    </PageShell>
  );
}
