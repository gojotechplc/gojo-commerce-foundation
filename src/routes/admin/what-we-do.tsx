import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getWhatWeDoHeaderFn, updateWhatWeDoHeaderFn } from "@/lib/admin.server";
import {
  AdminPageHeader,
  Field,
  SaveButton,
  StatusBanner,
  fieldCls,
} from "@/components/admin/form-helpers";
import { RichTextarea } from "@/components/admin/rich-textarea";

export const Route = createFileRoute("/admin/what-we-do")({
  loader: () => getWhatWeDoHeaderFn(),
  component: WhatWeDoAdmin,
});

function WhatWeDoAdmin() {
  const header = Route.useLoaderData();
  const router = useRouter();
  const [form, setForm] = useState({
    eyebrow: header?.eyebrow ?? "",
    heading: header?.heading ?? "",
    body: header?.body ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div>
      <AdminPageHeader
        title="What We Do header"
        description="Capability cards are edited under Capabilities."
      />
      <StatusBanner message={msg} />
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await updateWhatWeDoHeaderFn({ data: form });
          setMsg("Saved.");
          await router.invalidate();
        }}
      >
        <Field label="Eyebrow">
          <input className={fieldCls} value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
        </Field>
        <Field label="Heading">
          <input className={fieldCls} value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} />
        </Field>
        <Field label="Body">
          <RichTextarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </Field>
        <SaveButton />
      </form>
    </div>
  );
}
