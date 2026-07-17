import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createCapabilityFn,
  deleteCapabilityFn,
  getCapabilitiesAdminFn,
  reorderCapabilitiesFn,
  updateCapabilityFn,
} from "@/lib/admin.server";
import { AdminPageHeader, Field, fieldCls } from "@/components/admin/form-helpers";
import { SortableList } from "@/components/admin/sortable-list";
import { RichTextarea } from "@/components/admin/rich-textarea";

export const Route = createFileRoute("/admin/capabilities/")({
  loader: () => getCapabilitiesAdminFn(),
  component: CapsList,
});

function CapsList() {
  const caps = Route.useLoaderData();
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [shortDesc, setShort] = useState("");
  const [strategicPurpose, setPurpose] = useState("");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Capabilities"
        description="Each capability has its own public page at /capabilities/[slug]. Click Edit to change copy, images, and key functions."
      />
      <SortableList
        items={caps.map((c) => ({ id: c.id, label: c.title }))}
        onReorder={async (ids) => {
          await reorderCapabilitiesFn({ data: { ids } });
          await router.invalidate();
        }}
        renderItem={(item, i) => {
          const c = caps.find((x) => x.id === item.id)!;
          return (
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} · /capabilities/{c.slug}
                </div>
                <div className="font-display text-lg">{c.title}</div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.shortDesc}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm items-center">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={c.isVisible === 1}
                    onChange={async (e) => {
                      await updateCapabilityFn({
                        data: {
                          id: c.id,
                          title: c.title,
                          shortDesc: c.shortDesc,
                          strategicPurpose: c.strategicPurpose,
                          body: c.body,
                          pageEyebrow: c.pageEyebrow,
                          heroImagePath: c.heroImagePath,
                          cardImagePath: c.cardImagePath,
                          metaTitle: c.metaTitle,
                          metaDescription: c.metaDescription,
                          isVisible: e.target.checked ? 1 : 0,
                        },
                      });
                      await router.invalidate();
                    }}
                  />
                  Visible
                </label>
                <a
                  href={`/capabilities/${c.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  View ↗
                </a>
                <Link
                  to="/admin/capabilities/$id"
                  params={{ id: String(c.id) }}
                  className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-forest"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="text-destructive text-xs"
                  onClick={async () => {
                    if (confirm("Delete capability?")) {
                      await deleteCapabilityFn({ data: { id: c.id } });
                      await router.invalidate();
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        }}
      />

      <form
        className="space-y-3 border-t border-border pt-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await createCapabilityFn({
            data: { slug, title, shortDesc, strategicPurpose },
          });
          setSlug("");
          setTitle("");
          setShort("");
          setPurpose("");
          await router.invalidate();
        }}
      >
        <h2 className="font-display text-xl">Add capability</h2>
        <Field label="Slug (URL: /capabilities/your-slug)">
          <input
            className={fieldCls}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="import-trade"
            required
          />
        </Field>
        <Field label="Title">
          <input className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Short description (card / listing)">
          <RichTextarea value={shortDesc} onChange={(e) => setShort(e.target.value)} required />
        </Field>
        <Field label="Strategic purpose">
          <RichTextarea value={strategicPurpose} onChange={(e) => setPurpose(e.target.value)} required />
        </Field>
        <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add
        </button>
      </form>
    </div>
  );
}
