import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createPartnerTypeFn,
  createStandardFn,
  createVendorPropFn,
  deletePartnerTypeFn,
  deleteStandardFn,
  deleteVendorPropFn,
  getPartnershipsAdminFn,
  reorderPartnerTypesFn,
  reorderStandardsFn,
  reorderVendorPropsFn,
  updatePartnerTypeFn,
  updatePartnershipsPageFn,
  updateStandardFn,
  updateVendorPropFn,
  uploadPartnerLogoFn,
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

export const Route = createFileRoute("/admin/partnerships")({
  loader: () => getPartnershipsAdminFn(),
  component: PartnershipsAdmin,
});

function PartnershipsAdmin() {
  const { page, vendorProps, standards, partners } = Route.useLoaderData();
  const router = useRouter();
  const [form, setForm] = useState({
    headerEyebrow: page?.headerEyebrow ?? "",
    headerHeading: page?.headerHeading ?? "",
    headerBody: page?.headerBody ?? "",
    vendorSectionEyebrow: page?.vendorSectionEyebrow ?? "",
    vendorSectionHeading: page?.vendorSectionHeading ?? "",
    standardsEyebrow: page?.standardsEyebrow ?? "",
    standardsHeading: page?.standardsHeading ?? "",
    standardsBody: page?.standardsBody ?? "",
    institutionalEyebrow: page?.institutionalEyebrow ?? "",
    institutionalHeading: page?.institutionalHeading ?? "",
    ctaText: page?.ctaText ?? "",
    ctaSubtitle: page?.ctaSubtitle ?? "",
    ctaButtonLabel: page?.ctaButtonLabel ?? "",
    ctaButtonHref: page?.ctaButtonHref ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      <AdminPageHeader title="Partnerships page" />
      <StatusBanner message={msg} />
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await updatePartnershipsPageFn({ data: form });
          setMsg("Page saved.");
          await router.invalidate();
        }}
      >
        {Object.entries(form).map(([key, value]) => (
          <Field key={key} label={key}>
            {key.toLowerCase().includes("body") ||
            key.toLowerCase().includes("heading") ||
            key.toLowerCase().includes("text") ||
            key.toLowerCase().includes("subtitle") ? (
              <RichTextarea
                value={value ?? ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ) : (
              <input
                className={fieldCls}
                value={value ?? ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            )}
          </Field>
        ))}
        <SaveButton />
      </form>

      <ListSection
        title="Vendor value props"
        items={vendorProps.map((v) => ({ id: v.id, label: v.title, body: v.body, isVisible: v.isVisible }))}
        onReorder={async (ids) => {
          await reorderVendorPropsFn({ data: { ids } });
          await router.invalidate();
        }}
        onUpdate={async (id, title, body, isVisible) => {
          await updateVendorPropFn({ data: { id, title, body, isVisible } });
          await router.invalidate();
        }}
        onDelete={async (id) => {
          await deleteVendorPropFn({ data: { id } });
          await router.invalidate();
        }}
        onCreate={async (title, body) => {
          await createVendorPropFn({ data: { title, body } });
          await router.invalidate();
        }}
      />

      <section className="space-y-3">
        <h2 className="font-display text-xl">Standards</h2>
        <SortableList
          items={standards.map((s) => ({ id: s.id, label: s.label }))}
          onReorder={async (ids) => {
            await reorderStandardsFn({ data: { ids } });
            await router.invalidate();
          }}
          renderItem={(item) => {
            const s = standards.find((x) => x.id === item.id)!;
            return (
              <div className="flex gap-2 items-center">
                <input
                  className={fieldCls}
                  defaultValue={s.label}
                  onBlur={async (e) => {
                    if (e.target.value === s.label) return;
                    await updateStandardFn({
                      data: { id: s.id, label: e.target.value, isVisible: s.isVisible },
                    });
                    await router.invalidate();
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-destructive"
                  onClick={async () => {
                    await deleteStandardFn({ data: { id: s.id } });
                    await router.invalidate();
                  }}
                >
                  Delete
                </button>
              </div>
            );
          }}
        />
        <AddLabelForm
          onAdd={async (label) => {
            await createStandardFn({ data: { label } });
            await router.invalidate();
          }}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Partner types</h2>
        <SortableList
          items={partners.map((p) => ({ id: p.id, label: p.title }))}
          onReorder={async (ids) => {
            await reorderPartnerTypesFn({ data: { ids } });
            await router.invalidate();
          }}
          renderItem={(item) => {
            const p = partners.find((x) => x.id === item.id)!;
            return (
              <div className="space-y-2">
                <input
                  className={fieldCls}
                  defaultValue={p.title}
                  onBlur={async (e) => {
                    if (e.target.value === p.title) return;
                    await updatePartnerTypeFn({
                      data: {
                        id: p.id,
                        title: e.target.value,
                        body: p.body,
                        example: p.example,
                        isVisible: p.isVisible,
                      },
                    });
                    await router.invalidate();
                  }}
                />
                <input
                  className={fieldCls}
                  placeholder="Example"
                  defaultValue={p.example ?? ""}
                  onBlur={async (e) => {
                    const example = e.target.value || null;
                    if (example === p.example) return;
                    await updatePartnerTypeFn({
                      data: {
                        id: p.id,
                        title: p.title,
                        body: p.body,
                        example,
                        isVisible: p.isVisible,
                      },
                    });
                    await router.invalidate();
                  }}
                />
                <RichTextarea
                  defaultValue={p.body}
                  onBlur={async (e) => {
                    if (e.target.value === p.body) return;
                    await updatePartnerTypeFn({
                      data: {
                        id: p.id,
                        title: p.title,
                        body: e.target.value,
                        example: p.example,
                        isVisible: p.isVisible,
                      },
                    });
                    await router.invalidate();
                  }}
                />
                {p.logoPath && <img src={p.logoPath} alt="" className="h-10 object-contain" />}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.set("id", String(p.id));
                    fd.set("file", file);
                    await uploadPartnerLogoFn({ data: fd });
                    await router.invalidate();
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-destructive"
                  onClick={async () => {
                    if (confirm("Delete?")) {
                      await deletePartnerTypeFn({ data: { id: p.id } });
                      await router.invalidate();
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            );
          }}
        />
        <PartnerCreate onDone={() => router.invalidate()} />
      </section>
    </div>
  );
}

function ListSection({
  title,
  items,
  onReorder,
  onUpdate,
  onDelete,
  onCreate,
}: {
  title: string;
  items: { id: number; label: string; body: string; isVisible: number }[];
  onReorder: (ids: number[]) => Promise<void>;
  onUpdate: (id: number, title: string, body: string, isVisible: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreate: (title: string, body: string) => Promise<void>;
}) {
  const [t, setT] = useState("");
  const [b, setB] = useState("");
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl">{title}</h2>
      <SortableList
        items={items.map((i) => ({ id: i.id, label: i.label }))}
        onReorder={onReorder}
        renderItem={(item) => {
          const v = items.find((x) => x.id === item.id)!;
          return (
            <div className="space-y-2">
              <input
                className={fieldCls}
                defaultValue={v.label}
                onBlur={async (e) => {
                  if (e.target.value === v.label) return;
                  await onUpdate(v.id, e.target.value, v.body, v.isVisible);
                }}
              />
              <RichTextarea
                defaultValue={v.body}
                onBlur={async (e) => {
                  if (e.target.value === v.body) return;
                  await onUpdate(v.id, v.label, e.target.value, v.isVisible);
                }}
              />
              <button type="button" className="text-xs text-destructive" onClick={() => onDelete(v.id)}>
                Delete
              </button>
            </div>
          );
        }}
      />
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await onCreate(t, b);
          setT("");
          setB("");
        }}
      >
        <input className={fieldCls} value={t} onChange={(e) => setT(e.target.value)} placeholder="Title" required />
        <RichTextarea value={b} onChange={(e) => setB(e.target.value)} required />
        <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add
        </button>
      </form>
    </section>
  );
}

function AddLabelForm({ onAdd }: { onAdd: (label: string) => Promise<void> }) {
  const [label, setLabel] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await onAdd(label);
        setLabel("");
      }}
    >
      <input className={fieldCls} value={label} onChange={(e) => setLabel(e.target.value)} required />
      <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
        Add
      </button>
    </form>
  );
}

function PartnerCreate({ onDone }: { onDone: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await createPartnerTypeFn({ data: { title, body } });
        setTitle("");
        setBody("");
        await onDone();
      }}
    >
      <input className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <RichTextarea value={body} onChange={(e) => setBody(e.target.value)} required />
      <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
        Add partner type
      </button>
    </form>
  );
}
