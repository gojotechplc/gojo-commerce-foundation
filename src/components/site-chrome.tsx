import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { SiteChromeData } from "@/lib/site-types";

export function SiteHeader({ chrome }: { chrome: SiteChromeData }) {
  const { company, logo, nav, navCtaLabel, navCtaHref, navCtaVisible = true } = chrome;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container-page flex h-14 sm:h-16 items-center justify-between gap-3 sm:gap-6">
        <Link to="/" className="flex items-center gap-2 min-w-0" onClick={() => setMenuOpen(false)}>
          {logo ? (
            <>
              <img
                src={logo.filePath}
                alt={logo.altText || company.name}
                className="h-8 sm:h-9 w-auto max-w-[120px] sm:max-w-[140px] object-contain shrink-0"
              />
              <span className="hidden md:inline font-display text-lg tracking-tight truncate">
                {company.shortName}
                <span className="text-muted-foreground font-sans text-xs ml-1.5 align-middle">
                  PLC
                </span>
              </span>
            </>
          ) : (
            <>
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-sm bg-primary text-primary-foreground font-display text-lg leading-none shrink-0"
              >
                {(company.shortName || company.name).slice(0, 1).toUpperCase()}
              </span>
              <span className="font-display text-base sm:text-lg tracking-tight truncate">
                {company.shortName}
                <span className="text-muted-foreground font-sans text-xs ml-1.5 align-middle">
                  PLC
                </span>
              </span>
            </>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              to={n.href}
              className="text-foreground/75 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-medium" }}
              activeOptions={{ exact: n.href === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {navCtaVisible && (
            <a
              href={navCtaHref || company.shopUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-forest transition-colors"
            >
              {navCtaLabel}
            </a>
          )}
          <button
            type="button"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground hover:bg-muted"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <span className="text-lg leading-none" aria-hidden>
                ✕
              </span>
            ) : (
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile / tablet drawer */}
      <div
        className={`lg:hidden fixed inset-0 top-14 sm:top-16 z-40 transition-[visibility] ${
          menuOpen ? "visible" : "invisible"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          className={`absolute inset-0 bg-primary/40 backdrop-blur-[2px] transition-opacity ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <nav
          id="mobile-menu"
          className={`absolute top-0 inset-x-0 border-b border-border bg-background shadow-lg transition-transform duration-200 ${
            menuOpen ? "translate-y-0" : "-translate-y-3 opacity-0 pointer-events-none"
          }`}
        >
          <div className="container-page py-3 space-y-1 max-h-[min(70vh,calc(100dvh-3.5rem))] sm:max-h-[min(70vh,calc(100dvh-4rem))] overflow-y-auto">
            {nav.map((n) => (
              <Link
                key={n.href}
                to={n.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-sm px-3 py-3 text-base text-foreground/85 hover:bg-muted"
                activeProps={{ className: "block rounded-sm px-3 py-3 text-base font-medium text-primary bg-primary/5" }}
                activeOptions={{ exact: n.href === "/" }}
              >
                {n.label}
              </Link>
            ))}
            {navCtaVisible && (
              <a
                href={navCtaHref || company.shopUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex w-full items-center justify-center rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {navCtaLabel}
              </a>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ chrome }: { chrome: SiteChromeData }) {
  const { company, logo, footer } = chrome;
  return (
    <footer className="mt-16 sm:mt-24 border-t border-border/60 bg-primary text-primary-foreground">
      <div className="container-page py-10 sm:py-14 grid gap-8 sm:gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-2 max-w-sm">
          {logo ? (
            <div className="inline-flex items-center rounded-sm bg-primary-foreground px-3 py-2">
              <img
                src={logo.filePath}
                alt={logo.altText || company.name}
                className="h-8 sm:h-9 w-auto max-w-[180px] object-contain"
              />
            </div>
          ) : (
            <div className="font-display text-xl">{company.name}</div>
          )}
          {logo && <div className="mt-3 font-display text-lg">{company.name}</div>}
          <p className="mt-3 text-sm text-primary-foreground/75 leading-relaxed">
            {company.positioning}
          </p>
        </div>
        <div>
          <div className="eyebrow text-primary-foreground/70">Explore</div>
          <ul className="mt-3 space-y-2 text-sm">
            {footer.map((n) => (
              <li key={n.href}>
                <Link to={n.href} className="hover:text-accent transition-colors">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="eyebrow text-primary-foreground/70">Contact</div>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80 break-words">
            <li>{company.location}</li>
            <li>
              <a href={`mailto:${company.contactEmail}`} className="hover:text-accent">
                {company.contactEmail}
              </a>
            </li>
            <li>
              <a
                href={company.shopUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent"
              >
                gojoshop.et ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-primary-foreground/60">
          <div suppressHydrationWarning>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </div>
          <div>Addis Ababa · Ethiopia</div>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({
  children,
  chrome,
}: {
  children: React.ReactNode;
  chrome: SiteChromeData;
}) {
  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      <SiteHeader chrome={chrome} />
      <main className="flex-1 min-w-0 motion-safe:animate-[page-in_0.22s_ease-out]">{children}</main>
      <SiteFooter chrome={chrome} />
    </div>
  );
}
