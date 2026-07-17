import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createPromiseFn,
  deletePromiseFn,
  getPromiseFn,
  reorderPromiseFn,
  updatePromiseFn,
} from "@/lib/admin.server";
import { AdminPageHeader, Field, fieldCls } from "@/components/admin/form-helpers";
import { RichTextarea } from "@/components/admin/rich-textarea";
import { SortableList } from "@/components/admin/sortable-list";

export const Route = createFileRoute("/admin/promise")({
  loader: () => getPromiseFn(),
  component: PromiseAdmin,
});

function PromiseAdmin() {
  const items = Route.useLoaderData();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Gojo Promise" />
      <SortableList
        items={items.map((i) => ({ id: i.id, label: i.title }))}
        onReorder={async (ids) => {
          await reorderPromiseFn({ data: { ids } });
          await router.invalidate();
        }}
        renderItem={(item) => {
          const p = items.find((x) => x.id === item.id)!;
          return (
            <div className="space-y-2">
              <input
                className={fieldCls}
                defaultValue={p.title}
                onBlur={async (e) => {
                  if (e.target.value === p.title) return;
                  await updatePromiseFn({
                    data: { id: p.id, title: e.target.value, body: p.body, isVisible: p.isVisible },
                  });
                  await router.invalidate();
                }}
              />
              <RichTextarea
                defaultValue={p.body}
                onBlur={async (e) => {
                  if (e.target.value === p.body) return;
                  await updatePromiseFn({
                    data: { id: p.id, title: p.title, body: e.target.value, isVisible: p.isVisible },
                  });
                  await router.invalidate();
                }}
              />
              <div className="flex gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={p.isVisible === 1}
                    onChange={async (e) => {
                      await updatePromiseFn({
                        data: {
                          id: p.id,
                          title: p.title,
                          body: p.body,
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
                    if (confirm("Delete?")) {
                      await deletePromiseFn({ data: { id: p.id } });
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
        className="space-y-2 border-t pt-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await createPromiseFn({ data: { title, body } });
          setTitle("");
          setBody("");
          await router.invalidate();
        }}
      >
        <Field label="Title">
          <input className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Body">
          <RichTextarea value={body} onChange={(e) => setBody(e.target.value)} required />
        </Field>
        <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add item
        </button>
      </form>
    </div>
  );
}
