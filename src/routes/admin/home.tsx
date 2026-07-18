import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  clearHomeSectionImageFn,
  getHomeSectionsFn,
  updateHomeSectionFn,
  uploadHomeSectionImageFn,
} from "@/lib/admin.server";
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
  "mid_band",
  "promise_section",
  "audiences_section",
  "work_with_us",
  "capabilities_grid",
  "nav_cta",
  "promise_figure",
  "about_founders_header",
] as const;

const SECTION_HINTS: Partial<Record<(typeof KEYS)[number], string>> = {
  hero: "Full-bleed landscape hero. Upload a wide photo (16:9 or wider) — it becomes the background behind the headline.",
  hub_spoke: "Structure section beside the hub diagram. Optional side image.",
  mid_band: "Full-width photo band between Structure and the Gojo Promise.",
  work_with_us: "Optional image beside the final CTA block.",
  promise_figure: "Text overlay on the hero image panel.",
};

/** Recommended upload sizes shown next to the file picker */
const IMAGE_SIZE_HINTS: Partial<Record<(typeof KEYS)[number], string>> = {
  hero: "Recommended: 2400 × 1350 px (16:9 landscape). Minimum 1920 × 1080. JPEG or WebP, under 2 MB.",
  hub_spoke: "Recommended: 1200 × 900 px (4:3). JPEG or WebP, under 1 MB.",
  mid_band: "Recommended: 2400 × 1000 px (wide band). Minimum 1920 × 800. JPEG or WebP, under 2 MB.",
  work_with_us: "Recommended: 1200 × 900 px (4:3). JPEG or WebP, under 1 MB.",
};

const IMAGE_SECTIONS = new Set(["hero", "hub_spoke", "mid_band", "work_with_us"]);

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
        description="Edit home sections. Upload photos on hero, mid_band, hub_spoke, or work_with_us."
      />
      <div className="space-y-6">
        {KEYS.map((key) => (
          <SectionForm
            key={key}
            sectionKey={key}
            initial={byKey[key]}
            hint={SECTION_HINTS[key]}
            imageSizeHint={IMAGE_SIZE_HINTS[key]}
          />
        ))}
      </div>
    </div>
  );
}

function SectionForm({
  sectionKey,
  initial,
  hint,
  imageSizeHint,
}: {
  sectionKey: string;
  hint?: string;
  imageSizeHint?: string;
  initial?: {
    eyebrow: string | null;
    heading: string | null;
    body: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    cta2Label: string | null;
    cta2Href: string | null;
    imagePath: string | null;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(sectionKey === "hero");
  const [form, setForm] = useState({
    eyebrow: initial?.eyebrow ?? "",
    heading: initial?.heading ?? "",
    body: initial?.body ?? "",
    ctaLabel: initial?.ctaLabel ?? "",
    ctaHref: initial?.ctaHref ?? "",
    cta2Label: initial?.cta2Label ?? "",
    cta2Href: initial?.cta2Href ?? "",
  });
  const [imagePath, setImagePath] = useState(initial?.imagePath ?? null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [imgPending, setImgPending] = useState(false);
  const canHaveImage = IMAGE_SECTIONS.has(sectionKey);

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
            setErr(null);
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
            } catch (ex) {
              setErr(ex instanceof Error ? ex.message : "Save failed");
            } finally {
              setPending(false);
            }
          }}
        >
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          <StatusBanner message={msg} />
          <StatusBanner message={err} tone="err" />

          {canHaveImage && (
            <div className="rounded-md border border-border bg-muted/20 p-3 space-y-3">
              <div className="text-sm font-medium">Section image</div>
              {imagePath ? (
                <img
                  src={imagePath}
                  alt=""
                  className="max-h-48 w-full object-cover rounded-sm border border-border"
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  No image yet
                  {sectionKey === "hero"
                    ? " — the site shows the green promise panel until you upload one."
                    : "."}
                </p>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={imgPending}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImgPending(true);
                  setMsg(null);
                  setErr(null);
                  try {
                    const fd = new FormData();
                    fd.set("file", file);
                    fd.set("sectionKey", sectionKey);
                    const res = await uploadHomeSectionImageFn({ data: fd });
                    setImagePath(res.path);
                    setMsg("Section image updated — refresh the public page to see it.");
                    await router.invalidate();
                  } catch (ex) {
                    setErr(ex instanceof Error ? ex.message : "Upload failed");
                  } finally {
                    setImgPending(false);
                    e.target.value = "";
                  }
                }}
                className="block w-full text-sm"
              />
              {imageSizeHint && (
                <p className="text-xs text-muted-foreground">{imageSizeHint}</p>
              )}
              {imagePath && (
                <button
                  type="button"
                  className="text-xs text-destructive"
                  disabled={imgPending}
                  onClick={async () => {
                    if (!confirm("Remove section image?")) return;
                    setImgPending(true);
                    try {
                      await clearHomeSectionImageFn({ data: { sectionKey } });
                      setImagePath(null);
                      setMsg("Section image removed.");
                      await router.invalidate();
                    } catch (ex) {
                      setErr(ex instanceof Error ? ex.message : "Failed");
                    } finally {
                      setImgPending(false);
                    }
                  }}
                >
                  Remove image
                </button>
              )}
            </div>
          )}

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
