import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/site-chrome";
import { CONTACT_LIMITS } from "@/lib/contact-message";
import { getContactPageFn, submitContactMessageFn } from "@/lib/public.server";

type ContactSearch = {
  interest?: string;
  source?: "contact" | "partnerships";
};

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    interest: typeof search.interest === "string" ? search.interest : undefined,
    source: search.source === "partnerships" ? "partnerships" : "contact",
  }),
  loader: () => getContactPageFn(),
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
        : [{ title: "Contact — Gojo Solutions PLC" }],
      links: [{ rel: "canonical", href: meta?.canonical ?? "/contact" }],
    };
  },
  component: Contact,
});

function Contact() {
  const { chrome, page, interests } = Route.useLoaderData();
  const search = Route.useSearch();
  const company = chrome.company;

  const defaultInterest = useMemo(() => {
    if (search.interest) {
      const match = interests.find(
        (i) => i.label.toLowerCase() === search.interest!.toLowerCase(),
      );
      if (match) return match.label;
    }
    if (search.source === "partnerships") {
      const partnership = interests.find((i) => /partner/i.test(i.label));
      if (partnership) return partnership.label;
    }
    return interests[0]?.label ?? "Partnership";
  }, [interests, search.interest, search.source]);

  const source = search.source === "partnerships" ? "partnerships" : "contact";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    org: "",
    interest: defaultInterest,
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <PageShell chrome={chrome}>
      <section className="container-page pt-20 pb-16 grid gap-12 md:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="eyebrow rule-ochre">{page?.headerEyebrow ?? "Contact"}</div>
          <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-balance break-words">
            {page?.headerHeading ?? "Talk to Gojo Solutions."}
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
            {page?.headerBody ??
              "We work with vendors, partners, and institutions building the infrastructure of Ethiopian commerce. Send us a note — we read everything."}
          </p>

          <dl className="mt-10 space-y-6">
            <div>
              <dt className="eyebrow">{page?.headOfficeLabel ?? "Head office"}</dt>
              <dd className="mt-1 font-display text-xl">{company.location}</dd>
            </div>
            <div>
              <dt className="eyebrow">{page?.emailLabel ?? "Email"}</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${company.contactEmail}`}
                  className="font-display text-lg sm:text-xl text-primary hover:text-forest break-all"
                >
                  {company.contactEmail}
                </a>
              </dd>
            </div>
            {page?.showPhone === 1 && page?.phoneNumber && (
              <div>
                <dt className="eyebrow">{page.phoneLabel || "Phone"}</dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${page.phoneNumber.replace(/\s+/g, "")}`}
                    className="font-display text-xl text-primary hover:text-forest"
                  >
                    {page.phoneNumber}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="eyebrow">{page?.platformLabel ?? "Platform"}</dt>
              <dd className="mt-1">
                <a
                  href={company.shopUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display text-xl text-primary hover:text-forest"
                >
                  gojoshop.et ↗
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <form
          className="rounded-md border border-border bg-card p-6 md:p-8 space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus("saving");
            setError(null);
            try {
              await submitContactMessageFn({
                data: {
                  name: form.name,
                  email: form.email,
                  phone: form.phone,
                  organization: form.org,
                  interest: form.interest,
                  message: form.message,
                  source,
                },
              });
              setStatus("ok");
              setForm({
                name: "",
                email: "",
                phone: "",
                org: "",
                interest: defaultInterest,
                message: "",
              });
            } catch (err) {
              setStatus("err");
              setError(err instanceof Error ? err.message : "Could not send message");
            }
          }}
        >
          {source === "partnerships" && (
            <p className="text-xs text-muted-foreground border-b border-border pb-3">
              Partnership inquiry — we’ll route this to the partnerships team.
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name" required>
              <input
                required
                type="text"
                maxLength={CONTACT_LIMITS.name}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                autoComplete="name"
              />
            </Field>
            <Field label="Email" required>
              <input
                required
                type="email"
                maxLength={CONTACT_LIMITS.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
                autoComplete="email"
                inputMode="email"
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone (optional)">
              <input
                type="tel"
                maxLength={CONTACT_LIMITS.phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+251…"
              />
            </Field>
            <Field label="Organization">
              <input
                type="text"
                maxLength={CONTACT_LIMITS.organization}
                value={form.org}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
                className={inputCls}
                autoComplete="organization"
              />
            </Field>
          </div>
          <Field label="I'm interested in">
            <select
              value={form.interest}
              onChange={(e) => setForm({ ...form, interest: e.target.value })}
              className={inputCls}
            >
              {interests.map((i) => (
                <option key={i.id} value={i.label}>
                  {i.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Message" required>
            <textarea
              required
              rows={5}
              maxLength={CONTACT_LIMITS.message}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={inputCls}
            />
            <div className="mt-1 text-[11px] text-muted-foreground text-right">
              {form.message.length}/{CONTACT_LIMITS.message}
            </div>
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {status === "ok" && (
            <p className="text-sm text-primary">
              Thanks — your message was received. We’ll get back to you soon.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-forest transition-colors disabled:opacity-60"
          >
            {status === "saving" ? "Sending…" : "Send message"}
          </button>
          <p className="text-xs text-muted-foreground">
            {page?.formNote ??
              "Your message is saved securely. We typically reply within a few business days."}
          </p>
        </form>
      </section>
    </PageShell>
  );
}

const inputCls =
  "w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
