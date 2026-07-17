import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";

export const Route = createFileRoute("/partnerships")({
  head: () => ({
    meta: [
      { title: "Partnerships & Vendors — Gojo Solutions PLC" },
      {
        name: "description",
        content:
          "Vendor value proposition, quality accountability standards, and international partnership opportunities with Gojo Solutions PLC.",
      },
      { property: "og:title", content: "Partnerships & Vendors — Gojo Solutions PLC" },
      {
        property: "og:description",
        content:
          "Build with the infrastructure company behind Gojo Shop. For vendors, banks, logistics operators, and international suppliers.",
      },
      { property: "og:url", content: "/partnerships" },
    ],
    links: [{ rel: "canonical", href: "/partnerships" }],
  }),
  component: Partnerships,
});

const vendorValue = [
  {
    title: "Reach a verified buyer base",
    body: "20,000+ Gojo Shop users already trust the platform. Vendors inherit that trust from day one.",
  },
  {
    title: "Operate on real infrastructure",
    body: "Fulfillment, delivery verification, and Cash-on-Delivery reconciliation are handled — you focus on product.",
  },
  {
    title: "Grow with upstream support",
    body: "Import, sourcing, and market development capabilities are available to serious vendor partners.",
  },
];

const standards = [
  "Product authenticity and accurate listing information",
  "Response times for order confirmation and dispatch",
  "Consistent fulfillment quality across delivery cycles",
  "Transparent handling of returns and disputes",
];

const partnerTypes = [
  {
    type: "Financial institutions",
    example: "e.g. Siinqee Bank–style banking partnerships",
    body: "Payments, escrow, merchant financing, and reconciliation infrastructure.",
  },
  {
    type: "Logistics operators",
    body: "Regional fulfillment networks, verified last-mile, and warehouse partnerships.",
  },
  {
    type: "International suppliers",
    body: "Wholesale, category-brand, and manufacturer partnerships targeting the Ethiopian market.",
  },
  {
    type: "Technology partners",
    body: "Systems integrations with our digital platform — payments, identity, logistics APIs.",
  },
];

function Partnerships() {
  return (
    <PageShell>
      <section className="container-page pt-20 pb-12">
        <div className="eyebrow rule-ochre">Partnerships & vendors</div>
        <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl">
          We build alongside partners who take trust seriously.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Gojo Solutions works with vendors, banks, logistics operators, and
          international suppliers to build commerce infrastructure at national scale.
          If you're building for the long term, we should talk.
        </p>
      </section>

      {/* Vendors */}
      <section className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="eyebrow">For vendors</div>
            <h2 className="mt-3 font-display text-3xl leading-tight">
              Sell on infrastructure, not just a marketplace.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {vendorValue.map((v) => (
              <div key={v.title} className="rounded-md border border-border bg-card p-6">
                <div className="font-display text-lg leading-snug">{v.title}</div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="bg-secondary/60 border-y border-border/60 mt-8">
        <div className="container-page py-16 grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="eyebrow rule-ochre">Evaluation standards</div>
            <h2 className="mt-4 font-display text-3xl">
              Quality accountability, held in writing.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every vendor on Gojo Shop meets — and continues to meet — a defined
              standard. It's how we protect the platform's most valuable asset: trust.
            </p>
          </div>
          <ul className="space-y-4">
            {standards.map((s, i) => (
              <li
                key={s}
                className="flex gap-4 border-b border-border/70 pb-4 last:border-0"
              >
                <span className="font-display text-2xl text-accent leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Partner types */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <div className="eyebrow rule-ochre">International & institutional</div>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            Who we partner with beyond the storefront.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {partnerTypes.map((p) => (
            <article
              key={p.type}
              className="rounded-md border border-border bg-card p-6"
            >
              <div className="font-display text-xl">{p.type}</div>
              {p.example && (
                <div className="mt-1 text-xs text-muted-foreground italic">
                  {p.example}
                </div>
              )}
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {p.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-md bg-primary text-primary-foreground p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-lg">
            <div className="font-display text-2xl">
              Start a conversation with the partnerships team.
            </div>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Tell us who you are and what you're building. We'll come back within a
              few business days.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Contact partnerships →
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
