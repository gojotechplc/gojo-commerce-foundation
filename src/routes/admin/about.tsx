import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createAboutBlockFn,
  deleteAboutBlockFn,
  getAboutBlocksFn,
  getAboutHeaderFn,
  reorderAboutBlocksFn,
  updateAboutBlockFn,
  updateAboutHeaderFn,
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

export const Route = createFileRoute("/admin/about")({
  loader: async () => ({
    header: await getAboutHeaderFn(),
    blocks: await getAboutBlocksFn(),
  }),
  component: AboutAdmin,
});

function AboutAdmin() {
  const { header, blocks } = Route.useLoaderData();
  const router = useRouter();
  const [h, setH] = useState({
    eyebrow: header?.eyebrow ?? "",
    heading: header?.heading ?? "",
    body: header?.body ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newBody, setNewBody] = useState("");

  return (
    <div className="space-y-10">
      <AdminPageHeader title="About page" />
      <StatusBanner message={msg} />

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await updateAboutHeaderFn({ data: h });
          setMsg("Header saved.");
          await router.invalidate();
        }}
      >
        <h2 className="font-display text-xl">Page header</h2>
        <Field label="Eyebrow">
          <input className={fieldCls} value={h.eyebrow} onChange={(e) => setH({ ...h, eyebrow: e.target.value })} />
        </Field>
        <Field label="Heading">
          <input className={fieldCls} value={h.heading} onChange={(e) => setH({ ...h, heading: e.target.value })} />
        </Field>
        <Field label="Body">
          <RichTextarea value={h.body} onChange={(e) => setH({ ...h, body: e.target.value })} />
        </Field>
        <SaveButton />
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-xl">About blocks</h2>
        <SortableList
          items={blocks.map((b) => ({ id: b.id, label: b.label }))}
          onReorder={async (ids) => {
            await reorderAboutBlocksFn({ data: { ids } });
            await router.invalidate();
          }}
          renderItem={(item) => {
            const b = blocks.find((x) => x.id === item.id)!;
            return (
              <div className="space-y-2">
                <input
                  className={fieldCls}
                  defaultValue={b.label}
                  onBlur={async (e) => {
                    if (e.target.value === b.label) return;
                    await updateAboutBlockFn({
                      data: {
                        id: b.id,
                        label: e.target.value,
                        body: b.body,
                        isVisible: b.isVisible,
                      },
                    });
                    await router.invalidate();
                  }}
                />
                <RichTextarea
                  defaultValue={b.body}
                  onBlur={async (e) => {
                    if (e.target.value === b.body) return;
                    await updateAboutBlockFn({
                      data: {
                        id: b.id,
                        label: b.label,
                        body: e.target.value,
                        isVisible: b.isVisible,
                      },
                    });
                    await router.invalidate();
                  }}
                />
                <div className="flex gap-3 text-xs">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={b.isVisible === 1}
                      onChange={async (e) => {
                        await updateAboutBlockFn({
                          data: {
                            id: b.id,
                            label: b.label,
                            body: b.body,
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
                      if (confirm("Delete block?")) {
                        await deleteAboutBlockFn({ data: { id: b.id } });
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
          className="space-y-2 border-t border-border pt-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await createAboutBlockFn({ data: { label: newLabel, body: newBody } });
            setNewLabel("");
            setNewBody("");
            await router.invalidate();
          }}
        >
          <Field label="New block label">
            <input className={fieldCls} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} required />
          </Field>
          <Field label="Body">
            <RichTextarea value={newBody} onChange={(e) => setNewBody(e.target.value)} required />
          </Field>
          <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
            Add block
          </button>
        </form>
      </section>
    </div>
  );
}
