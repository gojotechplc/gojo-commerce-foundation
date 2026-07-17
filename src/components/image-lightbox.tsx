import { useEffect, useId } from "react";

export type LightboxItem = {
  id: number | string;
  src: string;
  title?: string | null;
  caption?: string | null;
};

type Props = {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function ImageLightbox({ items, index, onClose, onPrev, onNext }: Props) {
  const titleId = useId();
  const open = index !== null && items[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, onPrev, onNext]);

  if (index === null || !items[index]) return null;
  const item = items[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl rounded-md bg-background shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <div id={titleId} className="font-display text-lg truncate">
              {item.title || "Gallery image"}
            </div>
            {item.caption && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.caption}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-sm border border-border px-3 py-1.5 text-xs hover:bg-muted"
          >
            Close
          </button>
        </div>
        <div className="relative bg-muted/40">
          <img
            src={item.src}
            alt={item.title || ""}
            className="mx-auto max-h-[70vh] w-full object-contain"
          />
          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={onPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-sm bg-background/90 border border-border px-3 py-2 text-sm hover:bg-background"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm bg-background/90 border border-border px-3 py-2 text-sm hover:bg-background"
              >
                →
              </button>
            </>
          )}
        </div>
        <div className="px-4 py-2 text-xs text-muted-foreground text-center">
          {index + 1} / {items.length} · Esc to close
        </div>
      </div>
    </div>
  );
}
