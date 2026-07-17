export const fieldCls =
  "w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function SaveButton({
  pending,
  children = "Save",
}: {
  pending?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-forest disabled:opacity-60"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

export function StatusBanner({
  message,
  tone = "ok",
}: {
  message: string | null;
  tone?: "ok" | "err";
}) {
  if (!message) return null;
  return (
    <div
      className={`mb-4 rounded-sm border px-3 py-2 text-sm ${
        tone === "ok"
          ? "border-primary/30 bg-primary/5 text-foreground"
          : "border-destructive/40 bg-destructive/5 text-destructive"
      }`}
    >
      {message}
    </div>
  );
}
