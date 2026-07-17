import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  clearCompanyLogoFn,
  setCompanyLogoFn,
  updateCompanyFn,
  getCompanyFn,
} from "@/lib/admin.server";
import {
  AdminPageHeader,
  Field,
  SaveButton,
  StatusBanner,
  fieldCls,
} from "@/components/admin/form-helpers";
import { RichTextarea } from "@/components/admin/rich-textarea";

export const Route = createFileRoute("/admin/company")({
  loader: () => getCompanyFn(),
  component: CompanyPage,
});

function CompanyPage() {
  const data = Route.useLoaderData();
  const company = data.company;
  const primaryLogo = data.primaryLogo;
  const router = useRouter();
  const [form, setForm] = useState({
    name: company?.name ?? "",
    shortName: company?.shortName ?? "",
    tagline: company?.tagline ?? "",
    positioning: company?.positioning ?? "",
    location: company?.location ?? "",
    shopUrl: company?.shopUrl ?? "",
    contactEmail: company?.contactEmail ?? "",
  });
  const [altText, setAltText] = useState(primaryLogo?.altText ?? "Gojo Solutions logo");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [logoPending, setLogoPending] = useState(false);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Company info"
        description="Sitewide company details and the logo shown in the site header and footer."
      />
      <StatusBanner message={msg} />
      <StatusBanner message={err} tone="err" />

      <section className="space-y-4 rounded-md border border-border p-4">
        <div>
          <h2 className="font-display text-xl">Site logo</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            This is what visitors see in the header and footer. Uploading here updates the live
            site (Media library uploads alone do not).
          </p>
        </div>

        {primaryLogo ? (
          <div className="flex flex-wrap items-center gap-4 rounded-sm border border-border bg-muted/30 p-4">
            <img
              src={primaryLogo.filePath}
              alt={primaryLogo.altText}
              className="h-14 w-auto max-w-[220px] object-contain"
            />
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-medium">Active primary logo</div>
              <div className="font-mono text-muted-foreground break-all mt-1">
                {primaryLogo.filePath}
              </div>
            </div>
            <button
              type="button"
              className="text-xs text-destructive"
              disabled={logoPending}
              onClick={async () => {
                if (!confirm("Remove the site logo? The text mark will show instead.")) return;
                setLogoPending(true);
                setMsg(null);
                setErr(null);
                try {
                  await clearCompanyLogoFn();
                  setMsg("Logo removed from the site.");
                  await router.invalidate();
                } catch (ex) {
                  setErr(ex instanceof Error ? ex.message : "Failed to clear logo");
                } finally {
                  setLogoPending(false);
                }
              }}
            >
              Remove from site
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No active logo — the site currently uses the text mark (“G” + short name).
          </p>
        )}

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("altText", altText);
            setLogoPending(true);
            setMsg(null);
            setErr(null);
            try {
              await setCompanyLogoFn({ data: fd });
              setMsg("Logo updated — check the public site header/footer.");
              e.currentTarget.reset();
              await router.invalidate();
            } catch (ex) {
              setErr(ex instanceof Error ? ex.message : "Logo upload failed");
            } finally {
              setLogoPending(false);
            }
          }}
        >
          <Field label="Alt text">
            <input
              className={fieldCls}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </Field>
          <Field label="Logo image (PNG, SVG, WebP, JPEG)">
            <input name="file" type="file" accept="image/*" required />
          </Field>
          <button
            type="submit"
            disabled={logoPending}
            className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
          >
            {logoPending ? "Uploading…" : primaryLogo ? "Replace logo" : "Upload logo"}
          </button>
        </form>
        <p className="text-xs text-muted-foreground">
          Advanced variants (dark / favicon / og) are managed under{" "}
          <Link to="/admin/logo" className="text-primary hover:underline">
            Logo
          </Link>
          .
        </p>
      </section>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setMsg(null);
          setErr(null);
          try {
            await updateCompanyFn({ data: form });
            setMsg("Company details saved.");
            await router.invalidate();
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Save failed");
          } finally {
            setPending(false);
          }
        }}
      >
        <h2 className="font-display text-xl">Company details</h2>
        {(
          [
            ["name", "Company name"],
            ["shortName", "Short name"],
            ["tagline", "Tagline"],
            ["location", "Location"],
            ["shopUrl", "Shop URL"],
            ["contactEmail", "Contact email"],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <input
              className={fieldCls}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required
            />
          </Field>
        ))}
        <Field label="Positioning">
          <RichTextarea
            value={form.positioning}
            onChange={(e) => setForm({ ...form, positioning: e.target.value })}
            required
          />
        </Field>
        <SaveButton pending={pending} />
      </form>
    </div>
  );
}
