import { Link, createFileRoute } from "@tanstack/react-router";
import { getDashboardFn } from "@/lib/admin.server";
import { AdminPageHeader } from "@/components/admin/form-helpers";

export const Route = createFileRoute("/admin/")({
  loader: () => getDashboardFn(),
  component: Dashboard,
});

function Dashboard() {
  const data = Route.useLoaderData();
  const cards = [
    {
      label: "Unread messages",
      count: data.counts.unreadMessages,
      to: "/admin/messages" as const,
    },
    { label: "Capabilities", count: data.counts.capabilities, to: "/admin/capabilities" as const },
    { label: "Founders", count: data.counts.founders, to: "/admin/founders" as const },
    { label: "Promise items", count: data.counts.promise, to: "/admin/promise" as const },
    { label: "Partners", count: data.counts.partners, to: "/admin/partnerships" as const },
    { label: "Nav links", count: data.counts.nav, to: "/admin/navigation" as const },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description={`${data.companyName}${data.updatedAt ? ` · updated ${data.updatedAt}` : ""}`}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-md border border-border bg-card p-5 hover:border-primary/40 transition-colors"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {c.label}
            </div>
            <div className="mt-2 font-display text-3xl">{c.count}</div>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-forest"
        >
          View site ↗
        </a>
      </div>
    </div>
  );
}
