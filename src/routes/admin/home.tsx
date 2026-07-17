import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getHomeSectionsFn, updateHomeSectionFn } from "@/lib/admin.server";
import {
  AdminPageHeader,
  Field,
  SaveButton,
  StatusBanner,
  fieldCls,
} from "@/components/admin/form-helpers";
import { RichTextarea } from "@/components/admin/rich-textarea";

const KEYS = [
  "hero",
  "tagline_moment",
  "hub_spoke",
  "promise_section",
  "audiences_section",
  "work_with_us",
  "capabilities_grid",
  "nav_cta",
  "promise_figure",
  "about_founders_header",
] as const;

export const Route = createFileRoute("/admin/home")({
  loader: () => getHomeSectionsFn(),
  component: HomeEditor,
});

function HomeEditor() {
  const sections = Route.useLoaderData();
  const byKey = Object.fromEntries(sections.map((s) => [s.sectionKey, s]));

  return (
    <div>
      <AdminPageHeader
        title="Home page"
        description="Edit each named home section. Save sections independently."
      />
      <div className="space-y-6">
        {KEYS.map((key) => (
          <SectionForm key={key} sectionKey={key} initial={byKey[key]} />
        ))}
      </div>
    </div>
  );
}

function SectionForm({
  sectionKey,
  initial,
}: {
  sectionKey: string;
  initial?: {
    eyebrow: string | null;
    heading: string | null;
    body: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    cta2Label: string | null;
    cta2Href: string | null;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    eyebrow: initial?.eyebrow ?? "",
    heading: initial?.heading ?? "",
    body: initial?.body ?? "",
    ctaLabel: initial?.ctaLabel ?? "",
    ctaHref: initial?.ctaHref ?? "",
    cta2Label: initial?.cta2Label ?? "",
    cta2Href: initial?.cta2Href ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        className="w-full text-left px-4 py-3 font-display text-lg hover:bg-muted/40"
        onClick={() => setOpen(!open)}
      >
        {sectionKey} {open ? "▾" : "▸"}
      </button>
      {open && (
        <form
          className="border-t border-border p-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            setMsg(null);
            try {
              await updateHomeSectionFn({
                data: {
                  sectionKey,
                  eyebrow: form.eyebrow || null,
                  heading: form.heading || null,
                  body: form.body || null,
                  ctaLabel: form.ctaLabel || null,
                  ctaHref: form.ctaHref || null,
                  cta2Label: form.cta2Label || null,
                  cta2Href: form.cta2Href || null,
                },
              });
              setMsg("Saved.");
              await router.invalidate();
            } finally {
              setPending(false);
            }
          }}
        >
          <StatusBanner message={msg} />
          {(
            [
              ["eyebrow", "Eyebrow"],
              ["heading", "Heading"],
              ["ctaLabel", "CTA label"],
              ["ctaHref", "CTA href"],
              ["cta2Label", "CTA 2 label"],
              ["cta2Href", "CTA 2 href"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                className={fieldCls}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </Field>
          ))}
          <Field label="Body">
            <RichTextarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </Field>
          <SaveButton pending={pending} />
        </form>
      )}
    </div>
  );
}
