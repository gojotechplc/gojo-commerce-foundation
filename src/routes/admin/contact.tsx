import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createInterestFn,
  deleteInterestFn,
  getContactAdminFn,
  reorderInterestsFn,
  updateContactPageFn,
  updateInterestFn,
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

export const Route = createFileRoute("/admin/contact")({
  loader: () => getContactAdminFn(),
  component: ContactAdmin,
});

function ContactAdmin() {
  const { page, interests } = Route.useLoaderData();
  const router = useRouter();
  const [form, setForm] = useState({
    headerEyebrow: page?.headerEyebrow ?? "",
    headerHeading: page?.headerHeading ?? "",
    headerBody: page?.headerBody ?? "",
    headOfficeLabel: page?.headOfficeLabel ?? "Head office",
    emailLabel: page?.emailLabel ?? "Email",
    phoneLabel: page?.phoneLabel ?? "Phone",
    phoneNumber: page?.phoneNumber ?? "+251982808182",
    showPhone: page?.showPhone ?? 1,
    platformLabel: page?.platformLabel ?? "Platform",
    formNote: page?.formNote ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [newInterest, setNewInterest] = useState("");

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Contact page"
        description="Copy and contact details shown on /contact, including phone."
      />
      <StatusBanner message={msg} />
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await updateContactPageFn({
            data: {
              headerEyebrow: form.headerEyebrow,
              headerHeading: form.headerHeading,
              headerBody: form.headerBody,
              headOfficeLabel: form.headOfficeLabel,
              emailLabel: form.emailLabel,
              phoneLabel: form.phoneLabel,
              phoneNumber: form.phoneNumber || null,
              showPhone: form.showPhone,
              platformLabel: form.platformLabel,
              formNote: form.formNote || null,
            },
          });
          setMsg("Saved.");
          await router.invalidate();
        }}
      >
        {(
          [
            ["headerEyebrow", "Eyebrow"],
            ["headerHeading", "Heading"],
            ["headOfficeLabel", "Head office label"],
            ["emailLabel", "Email label"],
            ["platformLabel", "Platform label"],
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

        <div className="rounded-md border border-border p-4 space-y-3">
          <div className="font-display text-lg">Phone on contact page</div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.showPhone === 1}
              onChange={(e) =>
                setForm({ ...form, showPhone: e.target.checked ? 1 : 0 })
              }
            />
            Display phone number on the public contact page
          </label>
          <Field label="Phone label">
            <input
              className={fieldCls}
              value={form.phoneLabel}
              onChange={(e) => setForm({ ...form, phoneLabel: e.target.value })}
            />
          </Field>
          <Field label="Phone number">
            <input
              className={fieldCls}
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="+251982808182"
            />
          </Field>
        </div>

        <Field label="Header body">
          <RichTextarea
            value={form.headerBody}
            onChange={(e) => setForm({ ...form, headerBody: e.target.value })}
          />
        </Field>
        <Field label="Form note">
          <RichTextarea
            value={form.formNote}
            onChange={(e) => setForm({ ...form, formNote: e.target.value })}
          />
        </Field>
        <SaveButton />
      </form>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Interest options</h2>
        <SortableList
          items={interests.map((i) => ({ id: i.id, label: i.label }))}
          onReorder={async (ids) => {
            await reorderInterestsFn({ data: { ids } });
            await router.invalidate();
          }}
          renderItem={(item) => {
            const i = interests.find((x) => x.id === item.id)!;
            return (
              <div className="flex gap-2 items-center">
                <input
                  className={fieldCls}
                  defaultValue={i.label}
                  onBlur={async (e) => {
                    if (e.target.value === i.label) return;
                    await updateInterestFn({
                      data: { id: i.id, label: e.target.value, isVisible: i.isVisible },
                    });
                    await router.invalidate();
                  }}
                />
                <label className="text-xs flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={i.isVisible === 1}
                    onChange={async (e) => {
                      await updateInterestFn({
                        data: {
                          id: i.id,
                          label: i.label,
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
                  className="text-xs text-destructive"
                  onClick={async () => {
                    await deleteInterestFn({ data: { id: i.id } });
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
            await createInterestFn({ data: { label: newInterest } });
            setNewInterest("");
            await router.invalidate();
          }}
        >
          <input
            className={fieldCls}
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
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
