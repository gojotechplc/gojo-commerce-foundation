import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createWorkflowFn,
  deleteWorkflowFn,
  getGojoShopAdminFn,
  reorderWorkflowFn,
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
  const { page, workflows } = Route.useLoaderData();
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
    promiseEyebrow: page?.promiseEyebrow ?? "",
    promiseHeading: page?.promiseHeading ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [wTitle, setWTitle] = useState("");
  const [wBody, setWBody] = useState("");

  return (
    <div className="space-y-10">
      <AdminPageHeader title="Gojo Shop page" />
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
        <h2 className="font-display text-xl">Hero & stats</h2>
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
        <h2 className="font-display text-xl">Workflow images</h2>
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.set("id", String(w.id));
                    fd.set("file", file);
                    await uploadWorkflowImageFn({ data: fd });
                    await router.invalidate();
                  }}
                />
                <div className="flex gap-3 text-xs">
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
                      if (confirm("Delete?")) {
                        await deleteWorkflowFn({ data: { id: w.id } });
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
            <input className={fieldCls} value={wTitle} onChange={(e) => setWTitle(e.target.value)} required />
          </Field>
          <Field label="Body">
            <RichTextarea value={wBody} onChange={(e) => setWBody(e.target.value)} required />
          </Field>
          <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
            Add card
          </button>
        </form>
      </section>
    </div>
  );
}
