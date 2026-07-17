import { Outlet, createFileRoute } from "@tanstack/react-router";

/** Layout so /admin/capabilities and /admin/capabilities/$id can both render. */
export const Route = createFileRoute("/admin/capabilities")({
  component: () => <Outlet />,
});
