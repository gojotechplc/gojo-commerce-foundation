import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  createFounderFn,
  deleteFounderFn,
  deleteFounderPhotoFn,
  getFoundersFn,
  reorderFoundersFn,
  updateFounderFn,
  uploadFounderPhotoFn,
} from "@/lib/admin.server";
import {
  AdminPageHeader,
  Field,
  fieldCls,
} from "@/components/admin/form-helpers";
import { RichTextarea } from "@/components/admin/rich-textarea";
import { SortableList } from "@/components/admin/sortable-list";

export const Route = createFileRoute("/admin/founders")({
  loader: () => getFoundersFn(),
  component: FoundersAdmin,
});

function FoundersAdmin() {
  const founders = Route.useLoaderData();
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Founders" description="Manage founder cards on the About page." />
      <SortableList
        items={founders.map((f) => ({ id: f.id, label: f.name }))}
        onReorder={async (ids) => {
          await reorderFoundersFn({ data: { ids } });
          await router.invalidate();
        }}
        renderItem={(item) => {
          const f = founders.find((x) => x.id === item.id)!;
          return (
            <div className="space-y-2">
              <div className="flex gap-3 items-center">
                {f.photoPath ? (
                  <img src={f.photoPath} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 grid place-items-center font-display">
                    {f.name.slice(0, 1)}
                  </div>
                )}
                <div className="flex-1 grid gap-2 sm:grid-cols-2">
                  <input
                    className={fieldCls}
                    defaultValue={f.name}
                    onBlur={async (e) => {
                      if (e.target.value === f.name) return;
                      await updateFounderFn({
                        data: {
                          id: f.id,
                          name: e.target.value,
                          role: f.role,
                          bio: f.bio,
                          isVisible: f.isVisible,
                        },
                      });
                      await router.invalidate();
                    }}
                  />
                  <input
                    className={fieldCls}
                    defaultValue={f.role}
                    onBlur={async (e) => {
                      if (e.target.value === f.role) return;
                      await updateFounderFn({
                        data: {
                          id: f.id,
                          name: f.name,
                          role: e.target.value,
                          bio: f.bio,
                          isVisible: f.isVisible,
                        },
                      });
                      await router.invalidate();
                    }}
                  />
                </div>
              </div>
              <RichTextarea
                placeholder="Bio (optional)"
                defaultValue={f.bio ?? ""}
                onBlur={async (e) => {
                  const bio = e.target.value || null;
                  if (bio === f.bio) return;
                  await updateFounderFn({
                    data: {
                      id: f.id,
                      name: f.name,
                      role: f.role,
                      bio,
                      isVisible: f.isVisible,
                    },
                  });
                  await router.invalidate();
                }}
              />
              <div className="flex flex-wrap gap-3 text-xs items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.set("id", String(f.id));
                    fd.set("file", file);
                    await uploadFounderPhotoFn({ data: fd });
                    await router.invalidate();
                  }}
                />
                {f.photoPath && (
                  <button
                    type="button"
                    className="text-muted-foreground"
                    onClick={async () => {
                      await deleteFounderPhotoFn({ data: { id: f.id } });
                      await router.invalidate();
                    }}
                  >
                    Remove photo
                  </button>
                )}
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={f.isVisible === 1}
                    onChange={async (e) => {
                      await updateFounderFn({
                        data: {
                          id: f.id,
                          name: f.name,
                          role: f.role,
                          bio: f.bio,
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
                    if (confirm("Delete founder?")) {
                      await deleteFounderFn({ data: { id: f.id } });
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
        className="flex flex-wrap gap-2 items-end border-t border-border pt-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await createFounderFn({ data: { name, role } });
          setName("");
          setRole("");
          await router.invalidate();
        }}
      >
        <Field label="Name">
          <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Role">
          <input className={fieldCls} value={role} onChange={(e) => setRole(e.target.value)} required />
        </Field>
        <button type="submit" className="rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add founder
        </button>
      </form>
    </div>
  );
}
