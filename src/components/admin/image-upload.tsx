import { useState } from "react";
import { uploadMediaFn } from "@/lib/admin.server";

type Props = {
  value?: string | null;
  onUploaded: (path: string) => void;
  category?: string;
  label?: string;
  /** Shown under the file input, e.g. recommended pixel size */
  hint?: string;
};

export function ImageUpload({
  value,
  onUploaded,
  category = "general",
  label,
  hint,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {label && <div className="text-xs font-medium">{label}</div>}
      {value ? (
        <div className="rounded-sm border border-border bg-muted/40 p-3">
          {value.match(/\.(png|jpe?g|webp|gif|svg)$/i) ? (
            <img src={value} alt="" className="max-h-32 object-contain" />
          ) : null}
          <div className="mt-2 text-xs font-mono text-muted-foreground break-all">{value}</div>
        </div>
      ) : null}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError(null);
          try {
            const fd = new FormData();
            fd.set("file", file);
            fd.set("category", category);
            const res = await uploadMediaFn({ data: fd });
            onUploaded(res.path);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
        className="block w-full text-sm"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {busy && <div className="text-xs text-muted-foreground">Uploading…</div>}
      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
