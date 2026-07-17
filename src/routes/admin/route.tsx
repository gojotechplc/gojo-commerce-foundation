import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getAdminMeFn } from "@/lib/admin.server";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") return {};
    const me = await getAdminMeFn();
    if (!me) {
      throw redirect({ to: "/admin/login" });
    }
    if (me.forcePasswordChange && location.pathname !== "/admin/settings") {
      throw redirect({ to: "/admin/settings" });
    }
    return { admin: me };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <Outlet />;
  }

  return (
    <div className="h-dvh flex overflow-hidden bg-background text-foreground">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="lg:hidden shrink-0 flex items-center gap-3 border-b border-border bg-background px-4 h-14">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground hover:bg-muted"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>
          <div className="min-w-0">
            <div className="font-display text-base truncate">Gojo Admin</div>
            <div className="text-[11px] text-muted-foreground truncate">Menu</div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
