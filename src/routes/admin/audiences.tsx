import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createAudienceFn,
  deleteAudienceFn,
  getAudiencesFn,
  reorderAudiencesFn,
  updateAudienceFn,
} from "@/lib/admin.server";
import { AdminPageHeader, Field, fieldCls } from "@/components/admin/form-helpers";
import { RichTextarea } from "@/components/admin/rich-textarea";
import { SortableList } from "@/components/admin/sortable-list";

export const Route = createFileRoute("/admin/audiences")({
  loader: () => getAudiencesFn(),
  component: AudiencesAdmin,
});

function AudiencesAdmin() {
  const items = Route.useLoaderData();
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Audiences" />
      <SortableList
        items={items.map((i) => ({ id: i.id, label: i.label }))}
        onReorder={async (ids) => {
          await reorderAudiencesFn({ data: { ids } });
          await router.invalidate();
        }}
        renderItem={(item) => {
          const a = items.find((x) => x.id === item.id)!;
          return (
            <div className="space-y-2">
              <input
                className={fieldCls}
                defaultValue={a.label}
                onBlur={async (e) => {
                  if (e.target.value === a.label) return;
                  await updateAudienceFn({
                    data: { id: a.id, label: e.target.value, body: a.body, isVisible: a.isVisible },
                  });
                  await router.invalidate();
                }}
              />
              <RichTextarea
                defaultValue={a.body}
                onBlur={async (e) => {
                  if (e.target.value === a.body) return;
                  await updateAudienceFn({
                    data: { id: a.id, label: a.label, body: e.target.value, isVisible: a.isVisible },
                  });
                  await router.invalidate();
                }}
              />
              <div className="flex gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={a.isVisible === 1}
                    onChange={async (e) => {
                      await updateAudienceFn({
                        data: {
                          id: a.id,
                          label: a.label,
                          body: a.body,
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
                      await deleteAudienceFn({ data: { id: a.id } });
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
          await createAudienceFn({ data: { label, body } });
          setLabel("");
          setBody("");
          await router.invalidate();
        }}
      >
        <Field label="Label">
          <input className={fieldCls} value={label} onChange={(e) => setLabel(e.target.value)} required />
        </Field>
        <Field label="Body">
          <RichTextarea value={body} onChange={(e) => setBody(e.target.value)} required />
        </Field>
        <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add audience
        </button>
      </form>
    </div>
  );
}
