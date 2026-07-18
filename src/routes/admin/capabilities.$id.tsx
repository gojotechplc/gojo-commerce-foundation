import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  createCapabilityFunctionFn,
  deleteCapabilityFunctionFn,
  deleteCapabilityImageFn,
  getCapabilityAdminFn,
  reorderCapabilityFunctionsFn,
  updateCapabilityFn,
  updateCapabilityFunctionFn,
  uploadCapabilityImageFn,
} from "@/lib/admin.server";
import {
  AdminPageHeader,
  Field,
  SaveButton,
  StatusBanner,
  fieldCls,
} from "@/components/admin/form-helpers";
import { RichTextarea } from "@/components/admin/rich-textarea";
import { SortableList } from "@/components/admin/sortable-list";

export const Route = createFileRoute("/admin/capabilities/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return null;
    return getCapabilityAdminFn({ data: { id } });
  },
  component: CapDetail,
});

function CapDetail() {
  const cap = Route.useLoaderData();
  const router = useRouter();

  if (!cap) {
    return (
      <div className="space-y-4">
        <p>Capability not found.</p>
        <Link to="/admin/capabilities" className="text-primary text-sm">
          ← Back to list
        </Link>
      </div>
    );
  }

  const [form, setForm] = useState({
    title: cap.title,
    shortDesc: cap.shortDesc,
    strategicPurpose: cap.strategicPurpose,
    body: cap.body ?? "",
    pageEyebrow: cap.pageEyebrow ?? "Capability",
    metaTitle: cap.metaTitle ?? "",
    metaDescription: cap.metaDescription ?? "",
    isVisible: cap.isVisible,
  });
  const [heroPath, setHeroPath] = useState(cap.heroImagePath);
  const [cardPath, setCardPath] = useState(cap.cardImagePath);
  const [newFn, setNewFn] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setForm({
      title: cap.title,
      shortDesc: cap.shortDesc,
      strategicPurpose: cap.strategicPurpose,
      body: cap.body ?? "",
      pageEyebrow: cap.pageEyebrow ?? "Capability",
      metaTitle: cap.metaTitle ?? "",
      metaDescription: cap.metaDescription ?? "",
      isVisible: cap.isVisible,
    });
    setHeroPath(cap.heroImagePath);
    setCardPath(cap.cardImagePath);
  }, [cap]);

  async function uploadSlot(slot: "hero" | "card", file: File) {
    const fd = new FormData();
    fd.set("id", String(cap.id));
    fd.set("slot", slot);
    fd.set("file", file);
    const res = await uploadCapabilityImageFn({ data: fd });
    if (slot === "hero") setHeroPath(res.path);
    else setCardPath(res.path);
    await router.invalidate();
  }

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title={cap.title}
        description={`Public page: /capabilities/${cap.slug}`}
      />
      <div className="flex flex-wrap gap-3 text-sm">
        <a
          href={`/capabilities/${cap.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          Open public page ↗
        </a>
        <Link to="/admin/capabilities" className="text-muted-foreground hover:text-foreground">
          ← Back to list
        </Link>
      </div>

      <StatusBanner message={msg} />
      <StatusBanner message={err} tone="err" />

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setMsg(null);
          setErr(null);
          try {
            await updateCapabilityFn({
              data: {
                id: cap.id,
                title: form.title,
                shortDesc: form.shortDesc,
                strategicPurpose: form.strategicPurpose,
                body: form.body || null,
                pageEyebrow: form.pageEyebrow || null,
                heroImagePath: heroPath,
                cardImagePath: cardPath,
                metaTitle: form.metaTitle || null,
                metaDescription: form.metaDescription || null,
                isVisible: form.isVisible,
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
        <div className="rounded-md border border-border p-4 space-y-3">
          <h2 className="font-display text-xl">Basics</h2>
          <Field label="Slug (URL path — fixed after creation)">
            <input className={fieldCls} value={cap.slug} disabled />
          </Field>
          <Field label="Title">
            <input
              className={fieldCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </Field>
          <Field label="Page eyebrow">
            <input
              className={fieldCls}
              value={form.pageEyebrow}
              onChange={(e) => setForm({ ...form, pageEyebrow: e.target.value })}
              placeholder="Capability"
            />
          </Field>
          <Field label="Short description (listings & cards)">
            <RichTextarea
              value={form.shortDesc}
              onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
              required
              className="min-h-[80px]"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isVisible === 1}
              onChange={(e) => setForm({ ...form, isVisible: e.target.checked ? 1 : 0 })}
            />
            Visible on site
          </label>
        </div>

        <div className="rounded-md border border-border p-4 space-y-3">
          <h2 className="font-display text-xl">Page content</h2>
          <p className="text-xs text-muted-foreground">
            Use blank lines between paragraphs. Strategic purpose and body are shown on the
            dedicated capability page.
          </p>
          <Field label="Strategic purpose">
            <RichTextarea
              value={form.strategicPurpose}
              onChange={(e) => setForm({ ...form, strategicPurpose: e.target.value })}
              required
              className="min-h-[120px]"
            />
          </Field>
          <Field label="Long page body (rich multi-paragraph text)">
            <RichTextarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="min-h-[220px]"
              placeholder="Full narrative for this capability page…"
            />
          </Field>
        </div>

        <div className="rounded-md border border-border p-4 space-y-4">
          <h2 className="font-display text-xl">Images</h2>
          <ImageSlot
            label="Hero image (top of capability page)"
            path={heroPath}
            onFile={(f) => uploadSlot("hero", f)}
            hint="Recommended: 1920 × 1080 px (16:9). JPEG or WebP, under 1.5 MB."
            onClear={async () => {
              await deleteCapabilityImageFn({ data: { id: cap.id, slot: "hero" } });
              setHeroPath(null);
              await router.invalidate();
            }}
          />
          <ImageSlot
            label="Card image (optional — listings)"
            path={cardPath}
            onFile={(f) => uploadSlot("card", f)}
            hint="Recommended: 1200 × 800 px. JPEG or WebP, under 1 MB."
            onClear={async () => {
              await deleteCapabilityImageFn({ data: { id: cap.id, slot: "card" } });
              setCardPath(null);
              await router.invalidate();
            }}
          />
        </div>

        <div className="rounded-md border border-border p-4 space-y-3">
          <h2 className="font-display text-xl">SEO (optional)</h2>
          <Field label="Meta title">
            <input
              className={fieldCls}
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              placeholder={`${cap.title} — Gojo Solutions PLC`}
            />
          </Field>
          <Field label="Meta description">
            <RichTextarea
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className="min-h-[80px]"
            />
          </Field>
        </div>

        <SaveButton pending={pending} />
      </form>

      <section className="space-y-3 rounded-md border border-border p-4">
        <h2 className="font-display text-xl">Key functions</h2>
        <SortableList
          items={cap.functions.map((f) => ({ id: f.id, label: f.label }))}
          onReorder={async (ids) => {
            await reorderCapabilityFunctionsFn({ data: { ids } });
            await router.invalidate();
          }}
          renderItem={(item) => {
            const f = cap.functions.find((x) => x.id === item.id)!;
            return (
              <div className="flex gap-2">
                <input
                  className={fieldCls}
                  defaultValue={f.label}
                  onBlur={async (e) => {
                    if (e.target.value === f.label) return;
                    await updateCapabilityFunctionFn({
                      data: { id: f.id, label: e.target.value },
                    });
                    await router.invalidate();
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-destructive shrink-0"
                  onClick={async () => {
                    await deleteCapabilityFunctionFn({ data: { id: f.id } });
                    await router.invalidate();
                  }}
                >
                  Delete
                </button>
              </div>
            );
          }}
        />
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await createCapabilityFunctionFn({
              data: { capabilityId: cap.id, label: newFn },
            });
            setNewFn("");
            await router.invalidate();
          }}
        >
          <input
            className={fieldCls}
            value={newFn}
            onChange={(e) => setNewFn(e.target.value)}
            placeholder="New function bullet"
            required
          />
          <button
            type="submit"
            className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            Add
          </button>
        </form>
      </section>
    </div>
  );
}

function ImageSlot({
  label,
  path,
  onFile,
  onClear,
  hint = "Recommended: 1600 × 1000 px (landscape). JPEG or WebP, under 1.5 MB.",
}: {
  label: string;
  path: string | null | undefined;
  onFile: (file: File) => Promise<void>;
  onClear: () => Promise<void>;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium">{label}</div>
      {path ? (
        <div className="rounded-sm border border-border bg-muted/30 p-3 space-y-2">
          <img src={path} alt="" className="max-h-40 object-contain" />
          <div className="text-xs font-mono break-all text-muted-foreground">{path}</div>
          <button
            type="button"
            className="text-xs text-destructive"
            onClick={() => onClear()}
          >
            Remove image
          </button>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">No image uploaded</div>
      )}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            await onFile(file);
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {busy && <div className="text-xs text-muted-foreground">Uploading…</div>}
    </div>
  );
}
