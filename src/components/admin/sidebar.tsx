import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getUnreadMessageCountFn, logoutAdminFn } from "@/lib/admin.server";

type NavLink = {
  to: string;
  label: string;
  exact?: boolean;
  badge?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  links: NavLink[];
};

const groups: NavGroup[] = [
  {
    id: "inbox",
    label: "Inbox",
    links: [{ to: "/admin/messages", label: "Messages", badge: true }],
  },
  {
    id: "brand",
    label: "Brand & site",
    links: [
      { to: "/admin/company", label: "Company" },
      { to: "/admin/logo", label: "Logo" },
      { to: "/admin/navigation", label: "Navigation" },
      { to: "/admin/meta", label: "SEO / Meta" },
      { to: "/admin/media", label: "Media" },
    ],
  },
  {
    id: "pages",
    label: "Pages",
    links: [
      { to: "/admin/home", label: "Home" },
      { to: "/admin/about", label: "About" },
      { to: "/admin/what-we-do", label: "What We Do" },
      { to: "/admin/capabilities", label: "Capabilities" },
      { to: "/admin/gojo-shop", label: "Gojo Shop" },
      { to: "/admin/partnerships", label: "Partnerships" },
      { to: "/admin/contact", label: "Contact" },
    ],
  },
  {
    id: "content",
    label: "Shared content",
    links: [
      { to: "/admin/founders", label: "Founders" },
      { to: "/admin/promise", label: "Promise" },
      { to: "/admin/audiences", label: "Audiences" },
    ],
  },
  {
    id: "account",
    label: "Account",
    links: [{ to: "/admin/settings", label: "Settings" }],
  },
];

function linkIsActive(pathname: string, link: NavLink) {
  if (link.exact) return pathname === link.to;
  return pathname === link.to || pathname.startsWith(link.to + "/");
}

function groupContainsActive(pathname: string, group: NavGroup) {
  return group.links.some((l) => linkIsActive(pathname, l));
}

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function AdminSidebar({ mobileOpen, onClose }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [unread, setUnread] = useState(0);
  const activeGroupId = useMemo(
    () => groups.find((g) => groupContainsActive(pathname, g))?.id ?? null,
    [pathname],
  );
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeGroupId) return;
    setOpen((prev) => ({ ...prev, [activeGroupId]: true }));
  }, [activeGroupId]);

  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getUnreadMessageCountFn()
        .then((n) => {
          if (!cancelled) setUnread(n);
        })
        .catch(() => {
          if (!cancelled) setUnread(0);
        });
    };
    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const dashActive = pathname === "/admin" || pathname === "/admin/";

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-primary/50 backdrop-blur-[2px] lg:hidden transition-opacity ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-dvh w-[min(18rem,88vw)] shrink-0 flex flex-col border-r border-primary/20 bg-primary text-primary-foreground transition-transform duration-200 ease-out lg:translate-x-0 lg:w-60 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 px-4 py-4 border-b border-primary-foreground/15 flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-lg tracking-tight">Gojo Admin</div>
            <div className="text-xs text-primary-foreground/60 mt-0.5">Content CMS</div>
          </div>
          <button
            type="button"
            className="lg:hidden rounded-sm px-2 py-1 text-sm text-primary-foreground/80 hover:bg-primary-foreground/10"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 px-2 space-y-3">
          <Link
            to="/admin"
            onClick={onClose}
            className={`flex items-center rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
              dashActive
                ? "bg-accent text-accent-foreground"
                : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15"
            }`}
          >
            Dashboard
          </Link>

          <div className="h-px bg-primary-foreground/10 mx-1" />

          {groups.map((group) => {
            const isOpen = open[group.id] ?? false;
            const hasActive = group.id === activeGroupId;
            return (
              <div key={group.id} className="space-y-0.5">
                <button
                  type="button"
                  className={`w-full flex items-center justify-between rounded-sm px-3 py-2 text-[11px] font-medium uppercase tracking-wide transition-colors ${
                    hasActive
                      ? "text-accent"
                      : "text-primary-foreground/55 hover:text-primary-foreground/85 hover:bg-primary-foreground/5"
                  }`}
                  onClick={() =>
                    setOpen((prev) => ({ ...prev, [group.id]: !isOpen }))
                  }
                  aria-expanded={isOpen}
                >
                  <span>{group.label}</span>
                  <span
                    aria-hidden
                    className={`text-[10px] transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}
                  >
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-0.5 pl-1">
                    {group.links.map((l) => {
                      const active = linkIsActive(pathname, l);
                      const showBadge = l.badge && unread > 0;
                      return (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={onClose}
                          className={`flex items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                            active
                              ? "bg-accent text-accent-foreground"
                              : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                          }`}
                        >
                          <span>{l.label}</span>
                          {showBadge && (
                            <span
                              className={`min-w-5 h-5 px-1.5 rounded-sm text-[11px] font-medium inline-flex items-center justify-center ${
                                active
                                  ? "bg-accent-foreground/15 text-accent-foreground"
                                  : "bg-accent text-accent-foreground"
                              }`}
                            >
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 p-3 border-t border-primary-foreground/15 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="block rounded-sm px-3 py-2 text-sm text-accent hover:bg-primary-foreground/10"
          >
            View site ↗
          </a>
          <button
            type="button"
            className="w-full rounded-sm px-3 py-2 text-left text-sm text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={async () => {
              await logoutAdminFn();
              window.location.href = "/admin/login";
            }}
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
