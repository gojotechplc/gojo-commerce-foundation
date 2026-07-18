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
          const form = e.currentTarget; // capture before any await — React nullifies currentTarget after async
          const fd = new FormData(form);
          fd.set("variant", variant);
          fd.set("altText", altText);
          setMsg(null);
          setErr(null);
          try {
            const result = await createLogoFn({ data: fd });
            setMsg("Logo uploaded.");
            form.reset(); // reset before invalidate — invalidate may unmount the form
            // Immediately update the browser favicon without requiring a full reload
            if (variant === "favicon" && result?.path) {
              const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
              if (link) {
                link.href = result.path;
                link.type = result.path.endsWith(".svg") ? "image/svg+xml" : "image/png";
              } else {
                const newLink = document.createElement("link");
                newLink.rel = "icon";
                newLink.href = result.path;
                newLink.type = result.path.endsWith(".svg") ? "image/svg+xml" : "image/png";
                document.head.appendChild(newLink);
              }
            }
            await router.invalidate();
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
          <p className="mt-1 text-xs text-muted-foreground">
            Primary/dark: SVG or PNG ~800 × 200 px. Favicon: 512 × 512 px. OG: 1200 × 630 px.
          </p>
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
