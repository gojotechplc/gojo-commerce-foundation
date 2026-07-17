import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createFooterNavFn,
  createNavFn,
  deleteFooterNavFn,
  deleteNavFn,
  getFooterNavFn,
  getNavFn,
  reorderFooterNavFn,
  reorderNavFn,
  updateFooterNavFn,
  updateNavFn,
} from "@/lib/admin.server";
import { AdminPageHeader, Field, fieldCls } from "@/components/admin/form-helpers";
import { SortableList } from "@/components/admin/sortable-list";

export const Route = createFileRoute("/admin/navigation")({
  loader: async () => ({
    nav: await getNavFn(),
    footer: await getFooterNavFn(),
  }),
  component: NavigationPage,
});

function LinkEditor({
  title,
  items,
  onCreate,
  onUpdate,
  onReorder,
  onDelete,
}: {
  title: string;
  items: { id: number; label: string; href: string; isVisible: number }[];
  onCreate: (d: { label: string; href: string }) => Promise<void>;
  onUpdate: (d: {
    id: number;
    label: string;
    href: string;
    isVisible: number;
  }) => Promise<void>;
  onReorder: (ids: number[]) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl">{title}</h2>
      <SortableList
        items={items.map((i) => ({ id: i.id, label: i.label }))}
        onReorder={onReorder}
        renderItem={(item) => {
          const full = items.find((i) => i.id === item.id)!;
          return (
            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className={fieldCls}
                  defaultValue={full.label}
                  onBlur={async (e) => {
                    if (e.target.value === full.label) return;
                    await onUpdate({
                      id: full.id,
                      label: e.target.value,
                      href: full.href,
                      isVisible: full.isVisible,
                    });
                  }}
                />
                <input
                  className={fieldCls}
                  defaultValue={full.href}
                  onBlur={async (e) => {
                    if (e.target.value === full.href) return;
                    await onUpdate({
                      id: full.id,
                      label: full.label,
                      href: e.target.value,
                      isVisible: full.isVisible,
                    });
                  }}
                />
              </div>
              <div className="flex gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={full.isVisible === 1}
                    onChange={async (e) => {
                      await onUpdate({
                        id: full.id,
                        label: full.label,
                        href: full.href,
                        isVisible: e.target.checked ? 1 : 0,
                      });
                    }}
                  />
                  Visible
                </label>
                <button
                  type="button"
                  className="text-destructive"
                  onClick={async () => {
                    if (confirm("Delete link?")) await onDelete(full.id);
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
        className="flex flex-wrap gap-2 items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          await onCreate({ label, href });
          setLabel("");
          setHref("");
        }}
      >
        <Field label="Label">
          <input className={fieldCls} value={label} onChange={(e) => setLabel(e.target.value)} required />
        </Field>
        <Field label="Href">
          <input className={fieldCls} value={href} onChange={(e) => setHref(e.target.value)} required />
        </Field>
        <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add
        </button>
      </form>
    </section>
  );
}

function NavigationPage() {
  const { nav, footer } = Route.useLoaderData();
  const router = useRouter();
  const refresh = () => router.invalidate();

  return (
    <div className="space-y-12">
      <AdminPageHeader title="Navigation" description="Main nav and footer explore links." />
      <LinkEditor
        title="Main nav"
        items={nav}
        onCreate={async (d) => {
          await createNavFn({ data: d });
          await refresh();
        }}
        onUpdate={async (d) => {
          await updateNavFn({ data: d });
          await refresh();
        }}
        onReorder={async (ids) => {
          await reorderNavFn({ data: { ids } });
          await refresh();
        }}
        onDelete={async (id) => {
          await deleteNavFn({ data: { id } });
          await refresh();
        }}
      />
      <LinkEditor
        title="Footer links"
        items={footer}
        onCreate={async (d) => {
          await createFooterNavFn({ data: d });
          await refresh();
        }}
        onUpdate={async (d) => {
          await updateFooterNavFn({ data: d });
          await refresh();
        }}
        onReorder={async (ids) => {
          await reorderFooterNavFn({ data: { ids } });
          await refresh();
        }}
        onDelete={async (id) => {
          await deleteFooterNavFn({ data: { id } });
          await refresh();
        }}
      />
    </div>
  );
}
