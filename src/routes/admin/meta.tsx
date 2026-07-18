import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  getGlobalMetaFn,
  getPageMetaListFn,
  updateGlobalMetaFn,
  updatePageMetaFn,
} from "@/lib/admin.server";
import {
  AdminPageHeader,
  Field,
  SaveButton,
  StatusBanner,
  fieldCls,
} from "@/components/admin/form-helpers";
import { RichTextarea } from "@/components/admin/rich-textarea";
import { ImageUpload } from "@/components/admin/image-upload";

export const Route = createFileRoute("/admin/meta")({
  loader: async () => ({
    global: await getGlobalMetaFn(),
    pages: await getPageMetaListFn(),
  }),
  component: MetaPage,
});

function MetaPage() {
  const { global, pages } = Route.useLoaderData();
  const router = useRouter();
  const [tab, setTab] = useState<"global" | "pages">("global");
  const [g, setG] = useState({
    siteTitle: global?.siteTitle ?? "",
    siteDescription: global?.siteDescription ?? "",
    author: global?.author ?? "",
    ogSiteName: global?.ogSiteName ?? "",
    ogTitle: global?.ogTitle ?? "",
    ogDescription: global?.ogDescription ?? "",
    ogType: global?.ogType ?? "website",
    ogImagePath: global?.ogImagePath ?? "",
    twitterCard: global?.twitterCard ?? "summary_large_image",
    twitterTitle: global?.twitterTitle ?? "",
    twitterDescription: global?.twitterDescription ?? "",
    twitterImagePath: global?.twitterImagePath ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div>
      <AdminPageHeader title="SEO & Open Graph" />
      <div className="flex gap-2 mb-6">
        {(["global", "pages"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-sm px-3 py-1.5 text-sm ${
              tab === t ? "bg-primary text-primary-foreground" : "border border-border"
            }`}
          >
            {t === "global" ? "Global defaults" : "Per-page"}
          </button>
        ))}
      </div>
      <StatusBanner message={msg} />

      {tab === "global" ? (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            try {
              await updateGlobalMetaFn({
                data: {
                  ...g,
                  ogImagePath: g.ogImagePath || null,
                  twitterImagePath: g.twitterImagePath || null,
                },
              });
              setMsg("Global meta saved.");
              await router.invalidate();
            } finally {
              setPending(false);
            }
          }}
        >
          {(
            [
              ["siteTitle", "Site title"],
              ["siteDescription", "Site description"],
              ["author", "Author"],
              ["ogSiteName", "OG site name"],
              ["ogTitle", "OG title"],
              ["ogDescription", "OG description"],
              ["ogType", "OG type"],
              ["twitterCard", "Twitter card"],
              ["twitterTitle", "Twitter title"],
              ["twitterDescription", "Twitter description"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              {key.includes("Description") ? (
                <RichTextarea
                  value={g[key]}
                  onChange={(e) => setG({ ...g, [key]: e.target.value })}
                />
              ) : (
                <input
                  className={fieldCls}
                  value={g[key]}
                  onChange={(e) => setG({ ...g, [key]: e.target.value })}
                />
              )}
            </Field>
          ))}
          <ImageUpload
            label="OG image"
            category="og"
            value={g.ogImagePath}
            onUploaded={(path) => setG({ ...g, ogImagePath: path })}
            hint="Recommended: 1200 × 630 px (Open Graph). JPEG or PNG, under 1 MB."
          />
          <ImageUpload
            label="Twitter image"
            category="og"
            value={g.twitterImagePath}
            onUploaded={(path) => setG({ ...g, twitterImagePath: path })}
            hint="Recommended: 1200 × 630 px. JPEG or PNG, under 1 MB."
          />
          <SaveButton pending={pending} />
        </form>
      ) : (
        <div className="space-y-6">
          {pages.map((p) => (
            <PageMetaForm
              key={p.id}
              page={p}
              onSaved={async () => {
                setMsg(`Saved ${p.pageKey}`);
                await router.invalidate();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PageMetaForm({
  page,
  onSaved,
}: {
  page: {
    pageKey: string;
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogUrl: string;
    canonical: string;
  };
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({ ...page });
  const [pending, setPending] = useState(false);
  return (
    <form
      className="rounded-md border border-border p-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        try {
          await updatePageMetaFn({ data: form });
          await onSaved();
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="font-display text-lg capitalize">{page.pageKey}</div>
      {(
        [
          ["title", "Title"],
          ["description", "Description"],
          ["ogTitle", "OG title"],
          ["ogDescription", "OG description"],
          ["ogUrl", "OG URL"],
          ["canonical", "Canonical"],
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
      <SaveButton pending={pending} />
    </form>
  );
}
