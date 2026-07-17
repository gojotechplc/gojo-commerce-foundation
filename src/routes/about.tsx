import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site-chrome";
import { getAboutPageFn } from "@/lib/public.server";

export const Route = createFileRoute("/about")({
  loader: () => getAboutPageFn(),
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
        : [{ title: "About — Gojo Solutions PLC" }],
      links: [{ rel: "canonical", href: meta?.canonical ?? "/about" }],
    };
  },
  component: About,
});

function About() {
  const { chrome, header, blocks, founders, foundersHeader } = Route.useLoaderData();

  return (
    <PageShell chrome={chrome}>
      <section className="container-page pt-20 pb-12">
        <div className="eyebrow rule-ochre">{header?.eyebrow ?? "About"}</div>
        <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-6xl leading-[1.05] max-w-3xl text-balance">
          {header?.heading ?? "A holding company built to move Ethiopian commerce forward."}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {header?.body ?? chrome.company.positioning}
        </p>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2">
          {blocks.map((b) => (
            <div key={b.id} className="border-t border-primary/25 pt-6">
              <div className="eyebrow">{b.label}</div>
              <p className="mt-3 font-display text-2xl leading-snug">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 border-y border-border/60 mt-12">
        <div className="container-page py-20">
          <div className="eyebrow rule-ochre">
            {foundersHeader?.eyebrow ?? "Founders"}
          </div>
          <h2 className="mt-4 font-display text-3xl md:text-4xl max-w-2xl">
            {foundersHeader?.heading ?? "Three founders. One operating philosophy."}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {founders.map((f) => (
              <div key={f.id} className="rounded-md bg-card border border-border p-6">
                {f.photoPath ? (
                  <img
                    src={f.photoPath}
                    alt={f.name}
                    loading="lazy"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="h-16 w-16 rounded-full bg-primary/10 grid place-items-center font-display text-xl text-primary"
                  >
                    {f.name.slice(0, 1)}
                  </div>
                )}
                <div className="mt-4 font-display text-xl">{f.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
