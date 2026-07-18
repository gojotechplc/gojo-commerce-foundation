import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  clearWorkflowImageFn,
  createGalleryImageFn,
  createWorkflowFn,
  deleteGalleryImageFn,
  deleteWorkflowFn,
  getGojoShopAdminFn,
  reorderGalleryFn,
  reorderWorkflowFn,
  replaceGalleryImageFn,
  updateGalleryImageFn,
  updateGojoShopFn,
  updateWorkflowFn,
  uploadWorkflowImageFn,
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

export const Route = createFileRoute("/admin/gojo-shop")({
  loader: () => getGojoShopAdminFn(),
  component: GojoShopAdmin,
});

function GojoShopAdmin() {
  const { page, workflows, gallery } = Route.useLoaderData();
  const router = useRouter();
  const [form, setForm] = useState({
    heroEyebrow: page?.heroEyebrow ?? "",
    heroHeading: page?.heroHeading ?? "",
    heroBody: page?.heroBody ?? "",
    heroCtaLabel: page?.heroCtaLabel ?? "",
    stat1Label: page?.stat1Label ?? "",
    stat1Value: page?.stat1Value ?? "",
    stat2Label: page?.stat2Label ?? "",
    stat2Value: page?.stat2Value ?? "",
    stat3Label: page?.stat3Label ?? "",
    stat3Value: page?.stat3Value ?? "",
    stat4Label: page?.stat4Label ?? "",
    stat4Value: page?.stat4Value ?? "",
    workflowEyebrow: page?.workflowEyebrow ?? "",
    workflowHeading: page?.workflowHeading ?? "",
    galleryEyebrow: page?.galleryEyebrow ?? "Gallery",
    galleryHeading: page?.galleryHeading ?? "A closer look at Gojo Shop.",
    promiseEyebrow: page?.promiseEyebrow ?? "",
    promiseHeading: page?.promiseHeading ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [wTitle, setWTitle] = useState("");
  const [wBody, setWBody] = useState("");
  const [gTitle, setGTitle] = useState("");
  const [gCaption, setGCaption] = useState("");

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Gojo Shop page"
        description="Page copy, workflow cards, and a paginated gallery with lightbox on the public page."
      />
      <StatusBanner message={msg} />
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await updateGojoShopFn({ data: form });
          setMsg("Page saved.");
          await router.invalidate();
        }}
      >
        <h2 className="font-display text-xl">Hero, stats & section headings</h2>
        {Object.entries(form).map(([key, value]) => (
          <Field key={key} label={key}>
            {key.toLowerCase().includes("body") || key.toLowerCase().includes("heading") ? (
              <RichTextarea
                value={value}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ) : (
              <input
                className={fieldCls}
                value={value}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            )}
          </Field>
        ))}
        <SaveButton />
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-xl">Workflow cards</h2>
        <p className="text-xs text-muted-foreground">
          The three (or more) step cards. Replace or remove each card image without deleting the card.
        </p>
        <SortableList
          items={workflows.map((w) => ({ id: w.id, label: w.title }))}
          onReorder={async (ids) => {
            await reorderWorkflowFn({ data: { ids } });
            await router.invalidate();
          }}
          renderItem={(item) => {
            const w = workflows.find((x) => x.id === item.id)!;
            return (
              <div className="space-y-2">
                <input
                  className={fieldCls}
                  defaultValue={w.title}
                  onBlur={async (e) => {
                    if (e.target.value === w.title) return;
                    await updateWorkflowFn({
                      data: {
                        id: w.id,
                        title: e.target.value,
                        body: w.body,
                        isVisible: w.isVisible,
                      },
                    });
                    await router.invalidate();
                  }}
                />
                <RichTextarea
                  defaultValue={w.body}
                  onBlur={async (e) => {
                    if (e.target.value === w.body) return;
                    await updateWorkflowFn({
                      data: {
                        id: w.id,
                        title: w.title,
                        body: e.target.value,
                        isVisible: w.isVisible,
                      },
                    });
                    await router.invalidate();
                  }}
                />
                {w.imagePath ? (
                  <img src={w.imagePath} alt="" className="max-h-32 rounded-sm border" />
                ) : (
                  <div className="text-xs text-muted-foreground">No image yet</div>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended: 1200 × 800 px. JPEG or WebP, under 1 MB.
                </p>
                <div className="flex flex-wrap gap-3 items-center text-xs">
                  <label className="inline-flex items-center gap-1 cursor-pointer text-primary">
                    <span>{w.imagePath ? "Replace image" : "Upload image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.set("id", String(w.id));
                        fd.set("file", file);
                        await uploadWorkflowImageFn({ data: fd });
                        setMsg("Workflow image updated.");
                        await router.invalidate();
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {w.imagePath && (
                    <button
                      type="button"
                      className="text-destructive"
                      onClick={async () => {
                        if (!confirm("Remove this workflow image?")) return;
                        await clearWorkflowImageFn({ data: { id: w.id } });
                        setMsg("Workflow image removed.");
                        await router.invalidate();
                      }}
                    >
                      Remove image
                    </button>
                  )}
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={w.isVisible === 1}
                      onChange={async (e) => {
                        await updateWorkflowFn({
                          data: {
                            id: w.id,
                            title: w.title,
                            body: w.body,
                            isVisible: e.target.checked ? 1 : 0,
                          },
                        });
                        await router.invalidate();
                      }}
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm("Delete workflow card?")) {
                        await deleteWorkflowFn({ data: { id: w.id } });
                        await router.invalidate();
                      }
                    }}
                  >
                    Delete card
                  </button>
                </div>
              </div>
            );
          }}
        />
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await createWorkflowFn({ data: { title: wTitle, body: wBody } });
            setWTitle("");
            setWBody("");
            await router.invalidate();
          }}
        >
          <Field label="New workflow title">
            <input
              className={fieldCls}
              value={wTitle}
              onChange={(e) => setWTitle(e.target.value)}
              required
            />
          </Field>
          <Field label="Body">
            <RichTextarea value={wBody} onChange={(e) => setWBody(e.target.value)} required />
          </Field>
          <button
            type="submit"
            className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            Add card
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl">Gallery</h2>
        <p className="text-xs text-muted-foreground">
          Public page shows 6 per page with a click-to-open lightbox. Upload, replace, or remove
          images here. Recommended: 1600 × 1200 px (4:3). JPEG or WebP, under 1.5 MB each.
        </p>
        <SortableList
          items={gallery.map((g) => ({ id: g.id, label: g.title || g.imagePath }))}
          onReorder={async (ids) => {
            await reorderGalleryFn({ data: { ids } });
            await router.invalidate();
          }}
          renderItem={(item) => {
            const g = gallery.find((x) => x.id === item.id)!;
            return (
              <div className="space-y-2">
                <img
                  src={g.imagePath}
                  alt=""
                  className="max-h-40 w-full object-cover rounded-sm border"
                />
                <input
                  className={fieldCls}
                  defaultValue={g.title}
                  placeholder="Title"
                  onBlur={async (e) => {
                    if (e.target.value === g.title) return;
                    await updateGalleryImageFn({
                      data: {
                        id: g.id,
                        title: e.target.value,
                        caption: g.caption,
                        isVisible: g.isVisible,
                      },
                    });
                    await router.invalidate();
                  }}
                />
                <RichTextarea
                  defaultValue={g.caption ?? ""}
                  placeholder="Caption (optional)"
                  onBlur={async (e) => {
                    const next = e.target.value || null;
                    if (next === g.caption) return;
                    await updateGalleryImageFn({
                      data: {
                        id: g.id,
                        title: g.title,
                        caption: next,
                        isVisible: g.isVisible,
                      },
                    });
                    await router.invalidate();
                  }}
                />
                <div className="flex flex-wrap gap-3 text-xs items-center">
                  <label className="inline-flex items-center gap-1 cursor-pointer text-primary">
                    <span>Replace image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.set("id", String(g.id));
                        fd.set("file", file);
                        await replaceGalleryImageFn({ data: fd });
                        setMsg("Gallery image replaced.");
                        await router.invalidate();
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={g.isVisible === 1}
                      onChange={async (e) => {
                        await updateGalleryImageFn({
                          data: {
                            id: g.id,
                            title: g.title,
                            caption: g.caption,
                            isVisible: e.target.checked ? 1 : 0,
                          },
                        });
                        await router.invalidate();
                      }}
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    className="text-destructive"
                    onClick={async () => {
                      if (!confirm("Remove this gallery image?")) return;
                      await deleteGalleryImageFn({ data: { id: g.id } });
                      setMsg("Gallery image removed.");
                      await router.invalidate();
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          }}
        />
        {gallery.length === 0 && (
          <p className="text-sm text-muted-foreground">No gallery images yet.</p>
        )}
        <form
          className="space-y-2 border-t border-border pt-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("title", gTitle);
            fd.set("caption", gCaption);
            await createGalleryImageFn({ data: fd });
            setGTitle("");
            setGCaption("");
            e.currentTarget.reset();
            setMsg("Gallery image added.");
            await router.invalidate();
          }}
        >
          <h3 className="font-display text-lg">Add gallery image</h3>
          <Field label="Title">
            <input
              className={fieldCls}
              value={gTitle}
              onChange={(e) => setGTitle(e.target.value)}
              placeholder="Optional title"
            />
          </Field>
          <Field label="Caption">
            <RichTextarea
              value={gCaption}
              onChange={(e) => setGCaption(e.target.value)}
              placeholder="Optional caption"
            />
          </Field>
          <Field label="Image">
            <input name="file" type="file" accept="image/*" required />
            <p className="mt-1 text-xs text-muted-foreground">
              Recommended: 1600 × 1200 px (4:3). JPEG or WebP, under 1.5 MB.
            </p>
          </Field>
          <button
            type="submit"
            className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            Add to gallery
          </button>
        </form>
      </section>
    </div>
  );
}
