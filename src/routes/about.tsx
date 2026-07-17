import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { company } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Gojo Solutions PLC" },
      {
        name: "description",
        content:
          "Purpose, vision, mission, and the founders behind Gojo Solutions PLC — the parent company of Gojo Shop.",
      },
      { property: "og:title", content: "About Gojo Solutions PLC" },
      {
        property: "og:description",
        content:
          "The purpose, philosophy, and people behind Ethiopia's trust-driven commerce infrastructure company.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const blocks = [
  {
    label: "Purpose",
    body: "To make commerce in Ethiopia more reliable, efficient, and accessible — for customers, vendors, and the market as a whole.",
  },
  {
    label: "Vision",
    body: "A commerce ecosystem where trust is the default: where prices are fair, quality is accountable, and delivery is a promise that holds.",
  },
  {
    label: "Mission",
    body: "Build the infrastructure, systems, and partnerships that let Ethiopian commerce operate at a higher standard — with Gojo Shop as the proof, and five capability arms as the engine room.",
  },
  {
    label: "Corporate philosophy",
    body: "Identify the problem. Build the solution. Execute now. We work upstream, ship real systems, and hold ourselves to the same standard we ask of every vendor on the platform.",
  },
];

function About() {
  return (
    <PageShell>
      <section className="container-page pt-20 pb-12">
        <div className="eyebrow rule-ochre">About</div>
        <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl">
          A holding company built to move Ethiopian commerce forward.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {company.positioning}
        </p>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2">
          {blocks.map((b) => (
            <div key={b.label} className="border-t border-primary/25 pt-6">
              <div className="eyebrow">{b.label}</div>
              <p className="mt-3 font-display text-2xl leading-snug">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 border-y border-border/60 mt-12">
        <div className="container-page py-20">
          <div className="eyebrow rule-ochre">Founders</div>
          <h2 className="mt-4 font-display text-3xl md:text-4xl max-w-2xl">
            Three founders. One operating philosophy.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {company.founders.map((f) => (
              <div key={f.name} className="rounded-md bg-card border border-border p-6">
                <div
                  aria-hidden
                  className="h-14 w-14 rounded-full bg-primary/10 grid place-items-center text-primary font-display text-xl"
                >
                  {f.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="mt-5 font-display text-xl">{f.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
