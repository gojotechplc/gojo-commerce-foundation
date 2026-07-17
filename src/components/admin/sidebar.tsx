import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getUnreadMessageCountFn, logoutAdminFn } from "@/lib/admin.server";

const links = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/messages", label: "Messages", badge: true },
  { to: "/admin/company", label: "Company" },
  { to: "/admin/logo", label: "Logo" },
  { to: "/admin/navigation", label: "Navigation" },
  { to: "/admin/meta", label: "SEO / Meta" },
  { to: "/admin/home", label: "Home" },
  { to: "/admin/about", label: "About" },
  { to: "/admin/founders", label: "Founders" },
  { to: "/admin/capabilities", label: "Capabilities" },
  { to: "/admin/promise", label: "Promise" },
  { to: "/admin/audiences", label: "Audiences" },
  { to: "/admin/gojo-shop", label: "Gojo Shop" },
  { to: "/admin/what-we-do", label: "What We Do" },
  { to: "/admin/partnerships", label: "Partnerships" },
  { to: "/admin/contact", label: "Contact" },
  { to: "/admin/media", label: "Media" },
  { to: "/admin/settings", label: "Settings" },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [unread, setUnread] = useState(0);

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

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-secondary/40 min-h-screen flex flex-col">
      <div className="px-4 py-5 border-b border-border">
        <div className="font-display text-lg">Gojo Admin</div>
        <div className="text-xs text-muted-foreground mt-0.5">Content CMS</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.to
            : pathname === l.to || pathname.startsWith(l.to + "/");
          const showBadge = "badge" in l && l.badge && unread > 0;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-muted"
              }`}
            >
              <span>{l.label}</span>
              {showBadge && (
                <span
                  className={`min-w-5 h-5 px-1.5 rounded-sm text-[11px] font-medium inline-flex items-center justify-center ${
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="block text-sm text-primary hover:underline px-2"
        >
          View site ↗
        </a>
        <button
          type="button"
          className="w-full text-left text-sm px-2 py-1.5 text-muted-foreground hover:text-foreground"
          onClick={async () => {
            await logoutAdminFn();
            window.location.href = "/admin/login";
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
