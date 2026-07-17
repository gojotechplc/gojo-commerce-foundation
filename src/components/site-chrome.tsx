import { Link } from "@tanstack/react-router";
import type { SiteChromeData } from "@/lib/site-types";

export function SiteHeader({ chrome }: { chrome: SiteChromeData }) {
  const { company, logo, nav, navCtaLabel, navCtaHref } = chrome;
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-2.5 group min-w-0">
          {logo ? (
            <>
              <img
                src={logo.filePath}
                alt={logo.altText || company.name}
                className="h-9 w-auto max-w-[140px] object-contain shrink-0"
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
                G
              </span>
              <span className="font-display text-lg tracking-tight truncate">
                {company.shortName}
                <span className="text-muted-foreground font-sans text-xs ml-1.5 align-middle">
                  PLC
                </span>
              </span>
            </>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
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

        <a
          href={navCtaHref || company.shopUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-sm bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-forest transition-colors"
        >
          {navCtaLabel}
        </a>
      </div>
      <MobileNav nav={nav} />
    </header>
  );
}

function MobileNav({ nav }: { nav: SiteChromeData["nav"] }) {
  return (
    <nav className="md:hidden border-t border-border/60 bg-background overflow-x-auto">
      <div className="container-page flex gap-5 py-2.5 text-xs whitespace-nowrap">
        {nav.map((n) => (
          <Link
            key={n.href}
            to={n.href}
            className="text-foreground/70"
            activeProps={{ className: "text-primary font-medium" }}
            activeOptions={{ exact: n.href === "/" }}
          >
            {n.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function SiteFooter({ chrome }: { chrome: SiteChromeData }) {
  const { company, logo, footer } = chrome;
  return (
    <footer className="mt-24 border-t border-border/60 bg-primary text-primary-foreground">
      <div className="container-page py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 max-w-sm">
          {logo ? (
            <div className="inline-flex items-center rounded-sm bg-primary-foreground px-3 py-2">
              <img
                src={logo.filePath}
                alt={logo.altText || company.name}
                className="h-9 w-auto max-w-[200px] object-contain"
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
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
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
        <div className="container-page py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-primary-foreground/60">
          <div>
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
    <div className="min-h-screen flex flex-col">
      <SiteHeader chrome={chrome} />
      <main className="flex-1">{children}</main>
      <SiteFooter chrome={chrome} />
    </div>
  );
}
