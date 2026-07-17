import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site-chrome";
import { company } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Gojo Solutions PLC" },
      {
        name: "description",
        content:
          "Reach the Gojo Solutions PLC team in Addis Ababa — for vendors, partners, banks, and international suppliers.",
      },
      { property: "og:title", content: "Contact Gojo Solutions PLC" },
      {
        property: "og:description",
        content: "Get in touch with Gojo Solutions PLC in Addis Ababa.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    org: "",
    interest: "Partnership",
    message: "",
  });

  const mailto = `mailto:${company.contactEmail}?subject=${encodeURIComponent(
    `[${form.interest}] Inquiry from ${form.name || "website visitor"}`,
  )}&body=${encodeURIComponent(
    `Name: ${form.name}\nEmail: ${form.email}\nOrganization: ${form.org}\nInterest: ${form.interest}\n\n${form.message}`,
  )}`;

  return (
    <PageShell>
      <section className="container-page pt-20 pb-16 grid gap-12 md:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="eyebrow rule-ochre">Contact</div>
          <h1 className="mt-5 font-display text-4xl md:text-5xl leading-[1.05]">
            Talk to Gojo Solutions.
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
            We work with vendors, partners, and institutions building the
            infrastructure of Ethiopian commerce. Send us a note — we read
            everything.
          </p>

          <dl className="mt-10 space-y-6">
            <div>
              <dt className="eyebrow">Head office</dt>
              <dd className="mt-1 font-display text-xl">{company.location}</dd>
            </div>
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${company.contactEmail}`}
                  className="font-display text-xl text-primary hover:text-forest"
                >
                  {company.contactEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Platform</dt>
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
          action={mailto}
          method="post"
          encType="text/plain"
          className="rounded-md border border-border bg-card p-6 md:p-8 space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name" required>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Email" required>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Organization">
            <input
              type="text"
              value={form.org}
              onChange={(e) => setForm({ ...form, org: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="I'm interested in">
            <select
              value={form.interest}
              onChange={(e) => setForm({ ...form, interest: e.target.value })}
              className={inputCls}
            >
              <option>Partnership</option>
              <option>Vendor onboarding</option>
              <option>Investment / consulting</option>
              <option>Media / press</option>
              <option>General inquiry</option>
            </select>
          </Field>
          <Field label="Message" required>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={inputCls}
            />
          </Field>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-forest transition-colors"
          >
            Send message
          </button>
          <p className="text-xs text-muted-foreground">
            This form opens your email client. To wire it into a backend or
            serverless endpoint later, see the README.
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
