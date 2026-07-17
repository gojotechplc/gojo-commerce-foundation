import { useEffect, useId, useRef, useState } from "react";

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keep handler refs stable so the keyboard effect doesn't re-subscribe on every render
  const handlersRef = useRef({ onClose, onPrev, onNext });
  useEffect(() => {
    handlersRef.current = { onClose, onPrev, onNext };
  });

  const open = index !== null && !!items[index];
  const currentSrc = index !== null ? items[index]?.src : undefined;

  const [imgLoaded, setImgLoaded] = useState(false);
  useEffect(() => {
    setImgLoaded(false);
  }, [currentSrc]);

  // Autofocus close button when lightbox opens
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeButtonRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  // Keyboard navigation + scroll lock — stable, no handler deps
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlersRef.current.onClose();
      if (e.key === "ArrowLeft") handlersRef.current.onPrev();
      if (e.key === "ArrowRight") handlersRef.current.onNext();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (index === null || !items[index]) return null;
  const item = items[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-[fade-in_0.15s_ease-out]"
    >
      <button
        type="button"
        aria-label="Close lightbox"
        className="absolute inset-0 bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
        tabIndex={-1}
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
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            className="shrink-0 rounded-sm border border-border px-3 py-1.5 text-xs hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Close
          </button>
        </div>
        <div className="relative bg-muted/40 min-h-[12rem]">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
              <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          )}
          <img
            src={item.src}
            alt={item.title || ""}
            onLoad={() => setImgLoaded(true)}
            className={`mx-auto max-h-[70vh] w-full object-contain transition-opacity duration-200 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={onPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-sm bg-background/90 border border-border px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm bg-background/90 border border-border px-3 py-2 text-sm hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                →
              </button>
            </>
          )}
        </div>
        <div className="px-4 py-2 text-xs text-muted-foreground text-center">
          {index + 1} / {items.length} · Esc to close · ← → to navigate
        </div>
      </div>
    </div>
  );
}
