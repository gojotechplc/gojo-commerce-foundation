import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createLogoFn,
  deleteLogoFn,
  getLogosFn,
  updateLogoFn,
} from "@/lib/admin.server";
import {
  AdminPageHeader,
  Field,
  StatusBanner,
  fieldCls,
} from "@/components/admin/form-helpers";

export const Route = createFileRoute("/admin/logo")({
  loader: () => getLogosFn(),
  component: LogoPage,
});

function LogoPage() {
  const logos = Route.useLoaderData();
  const router = useRouter();
  const [variant, setVariant] = useState("primary");
  const [altText, setAlt] = useState("Gojo Solutions logo");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div>
      <AdminPageHeader
        title="Logo"
        description="Upload logo variants. The active primary logo appears on the public site. Prefer Company → Site logo for the main brand mark."
      />
      <StatusBanner message={msg} />
      <StatusBanner message={err} tone="err" />

      <form
        className="mb-10 space-y-3 rounded-md border border-border p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set("variant", variant);
          fd.set("altText", altText);
          setMsg(null);
          setErr(null);
          try {
            await createLogoFn({ data: fd });
            setMsg("Logo uploaded.");
            await router.invalidate();
            e.currentTarget.reset();
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Upload failed");
          }
        }}
      >
        <div className="font-display text-lg">Upload logo</div>
        <Field label="Variant">
          <select
            className={fieldCls}
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
          >
            <option value="primary">primary</option>
            <option value="dark">dark</option>
            <option value="favicon">favicon</option>
            <option value="og">og</option>
          </select>
        </Field>
        <Field label="Alt text">
          <input
            className={fieldCls}
            value={altText}
            onChange={(e) => setAlt(e.target.value)}
          />
        </Field>
        <Field label="File">
          <input name="file" type="file" accept="image/*" required />
        </Field>
        <button
          type="submit"
          className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Upload
        </button>
      </form>

      <div className="space-y-3">
        {logos.map((l) => (
          <div
            key={l.id}
            className="flex flex-wrap items-center gap-4 rounded-md border border-border p-4"
          >
            <img src={l.filePath} alt={l.altText} className="h-12 object-contain" />
            <div className="flex-1 text-sm">
              <div className="font-medium">{l.variant}</div>
              <div className="font-mono text-xs text-muted-foreground">{l.filePath}</div>
            </div>
            <label className="text-xs flex items-center gap-2">
              <input
                type="checkbox"
                checked={l.isActive === 1}
                onChange={async (e) => {
                  await updateLogoFn({
                    data: { id: l.id, isActive: e.target.checked ? 1 : 0 },
                  });
                  await router.invalidate();
                }}
              />
              Active
            </label>
            <button
              type="button"
              className="text-sm text-destructive"
              onClick={async () => {
                if (!confirm("Delete this logo?")) return;
                await deleteLogoFn({ data: { id: l.id } });
                await router.invalidate();
              }}
            >
              Delete
            </button>
          </div>
        ))}
        {logos.length === 0 && (
          <p className="text-sm text-muted-foreground">No logos uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
