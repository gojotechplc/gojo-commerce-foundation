import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
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
  if (pathname === "/admin/login") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
