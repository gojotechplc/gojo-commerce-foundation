import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { deleteMediaFn, listMediaFn, uploadMediaFn } from "@/lib/admin.server";
import { AdminPageHeader, Field, StatusBanner, fieldCls } from "@/components/admin/form-helpers";

export const Route = createFileRoute("/admin/media")({
  loader: () => listMediaFn(),
  component: MediaAdmin,
});

function MediaAdmin() {
  const files = Route.useLoaderData();
  const router = useRouter();
  const [category, setCategory] = useState("general");
  const [msg, setMsg] = useState<string | null>(null);
  const grouped = files.reduce<Record<string, typeof files>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Media library"
        description="File browser for public/uploads. To change the live site logo, use Company → Site logo (Media alone does not update the header)."
      />
      <StatusBanner message={msg} />

      <form
        className="flex flex-wrap gap-3 items-end rounded-md border border-border p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set("category", category);
          const res = await uploadMediaFn({ data: fd });
          setMsg(`Uploaded ${res.path}`);
          e.currentTarget.reset();
          await router.invalidate();
        }}
      >
        <Field label="Category">
          <select className={fieldCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {["logo", "gojo-shop", "founders", "partners", "og", "general", "capabilities"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="File">
          <input name="file" type="file" accept="image/*" required />
        </Field>
        <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
          Upload
        </button>
      </form>

      {Object.entries(grouped).map(([cat, list]) => (
        <section key={cat} className="space-y-3">
          <h2 className="font-display text-xl capitalize">{cat}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((f) => (
              <div key={f.path} className="rounded-md border border-border p-3 space-y-2">
                <img src={f.path} alt="" className="h-28 w-full object-contain bg-muted/40" />
                <div className="text-xs font-mono break-all">{f.path}</div>
                <div className="text-xs text-muted-foreground">
                  {(f.size / 1024).toFixed(1)} KB
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    className="text-primary"
                    onClick={async () => {
                      await navigator.clipboard.writeText(f.path);
                      setMsg("Path copied.");
                    }}
                  >
                    Copy path
                  </button>
                  <button
                    type="button"
                    className="text-destructive"
                    onClick={async () => {
                      if (!confirm("Delete file?")) return;
                      await deleteMediaFn({ data: { path: f.path } });
                      await router.invalidate();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {files.length === 0 && (
        <p className="text-sm text-muted-foreground">No uploads yet.</p>
      )}
    </div>
  );
}
