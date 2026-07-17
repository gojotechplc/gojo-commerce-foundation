import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { company, promise } from "@/lib/content";

export const Route = createFileRoute("/gojo-shop")({
  head: () => ({
    meta: [
      { title: "Gojo Shop — The core engine of Gojo Solutions PLC" },
      {
        name: "description",
        content:
          "Gojo Shop is Ethiopia's trust-driven multi-vendor e-commerce platform with 20,000+ users and a verified Cash-on-Delivery model. It's the core engine of Gojo Solutions PLC.",
      },
      { property: "og:title", content: "Gojo Shop — the core engine" },
      {
        property: "og:description",
        content:
          "Ethiopia's trust-driven multi-vendor e-commerce platform. 20,000+ users. Cash-on-Delivery. Verified fulfillment.",
      },
      { property: "og:url", content: "/gojo-shop" },
    ],
    links: [{ rel: "canonical", href: "/gojo-shop" }],
  }),
  component: GojoShop,
});

const workflowImages = [
  {
    file: "gojoshop-order-flow.png",
    title: "Order flow",
    body: "From browse to Cash-on-Delivery confirmation — a workflow designed for buyers who need to see the product before they pay.",
  },
  {
    file: "gojoshop-vendor-dashboard.png",
    title: "Vendor dashboard",
    body: "The operations surface Ethiopian vendors use to list, manage, and fulfill orders with accountability.",
  },
  {
    file: "gojoshop-delivery-verification.png",
    title: "Delivery verification",
    body: "The final-mile check that closes the trust gap between order placed and cash exchanged.",
  },
];

function GojoShop() {
  return (
    <PageShell>
      <section className="container-page pt-20 pb-12 grid gap-12 md:grid-cols-[1.15fr_1fr] items-end">
        <div>
          <div className="eyebrow rule-ochre">Core engine</div>
          <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05]">
            Gojo Shop is where the promise ships.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Gojo Shop is Ethiopia's trust-driven multi-vendor commerce platform —
            20,000+ users, Cash-on-Delivery by default, and vendors held to a
            standard of quality accountability. Everything else Gojo Solutions
            does exists to make this platform more reliable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={company.shopUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-forest"
            >
              Open gojoshop.et ↗
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-6">
          <div className="rounded-md bg-primary text-primary-foreground p-6">
            <dt className="eyebrow text-primary-foreground/70">Active users</dt>
            <dd className="mt-2 font-display text-4xl">20,000+</dd>
          </div>
          <div className="rounded-md bg-card border border-border p-6">
            <dt className="eyebrow">Model</dt>
            <dd className="mt-2 font-display text-2xl leading-tight">
              Cash on Delivery
            </dd>
          </div>
          <div className="rounded-md bg-card border border-border p-6">
            <dt className="eyebrow">Type</dt>
            <dd className="mt-2 font-display text-2xl leading-tight">Multi-vendor</dd>
          </div>
          <div className="rounded-md bg-accent text-accent-foreground p-6">
            <dt className="eyebrow text-accent-foreground/70">Market</dt>
            <dd className="mt-2 font-display text-2xl leading-tight">Ethiopia</dd>
          </div>
        </dl>
      </section>

      {/* Workflow */}
      <section className="container-page py-16">
        <div className="max-w-2xl">
          <div className="eyebrow rule-ochre">Inside the platform</div>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            How Gojo Shop works, end to end.
          </h2>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {workflowImages.map((w) => (
            <figure key={w.file} className="flex flex-col">
              <div className="aspect-[4/3] rounded-md border border-dashed border-primary/30 bg-secondary/60 grid place-items-center p-6 text-center">
                <div>
                  <div className="eyebrow">[PLACEHOLDER IMAGE]</div>
                  <div className="mt-2 text-sm text-muted-foreground font-mono">
                    /images/{w.file}
                  </div>
                </div>
              </div>
              <figcaption className="mt-4">
                <div className="font-display text-lg">{w.title}</div>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {w.body}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Promise as it applies to shop */}
      <section className="bg-primary text-primary-foreground border-y border-border/60">
        <div className="container-page py-20">
          <div className="max-w-2xl">
            <div className="eyebrow text-primary-foreground/70 rule-ochre">
              The Gojo Promise, on the platform
            </div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              What every Gojo Shop transaction is engineered to guarantee.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {promise.map((p) => (
              <div
                key={p.title}
                className="rounded-md border border-primary-foreground/15 bg-primary-foreground/5 p-6"
              >
                <div className="font-display text-xl">{p.title}</div>
                <p className="mt-3 text-sm text-primary-foreground/80 leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
