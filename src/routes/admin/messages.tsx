import { Link, createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  clearContactMessagesFn,
  deleteContactMessageFn,
  getContactMessagesFn,
  markMessageReadFn,
} from "@/lib/admin.server";
import { MESSAGE_PAGE_SIZE, type MessageListFilter } from "@/lib/contact-message";
import { AdminPageHeader, StatusBanner, fieldCls } from "@/components/admin/form-helpers";

type MessagesSearch = {
  page: number;
  source: "all" | "contact" | "partnerships";
  status: "all" | "read" | "unread";
  from?: string;
  to?: string;
  interest?: string;
};

export const Route = createFileRoute("/admin/messages")({
  validateSearch: (search: Record<string, unknown>): MessagesSearch => ({
    page: Math.max(1, Number(search.page) || 1),
    source:
      search.source === "contact" || search.source === "partnerships"
        ? search.source
        : "all",
    status:
      search.status === "read" || search.status === "unread" ? search.status : "all",
    from: typeof search.from === "string" && search.from ? search.from : undefined,
    to: typeof search.to === "string" && search.to ? search.to : undefined,
    interest:
      typeof search.interest === "string" && search.interest ? search.interest : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    getContactMessagesFn({
      data: {
        page: deps.page,
        pageSize: MESSAGE_PAGE_SIZE,
        source: deps.source,
        status: deps.status,
        from: deps.from,
        to: deps.to,
        interest: deps.interest,
      },
    }),
  component: MessagesInbox,
});

function MessagesInbox() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/messages" });
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(data.items[0]?.id ?? null);
  const [msg, setMsg] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    source: search.source,
    status: search.status,
    from: search.from ?? "",
    to: search.to ?? "",
    interest: search.interest ?? "",
  });

  useEffect(() => {
    setDraft({
      source: search.source,
      status: search.status,
      from: search.from ?? "",
      to: search.to ?? "",
      interest: search.interest ?? "",
    });
  }, [search]);

  useEffect(() => {
    if (!data.items.some((m) => m.id === selectedId)) {
      setSelectedId(data.items[0]?.id ?? null);
    }
  }, [data.items, selectedId]);

  const selected = data.items.find((m) => m.id === selectedId) ?? null;

  const applyFilters = (next: Partial<MessagesSearch> = {}) => {
    void navigate({
      search: {
        page: next.page ?? 1,
        source: next.source ?? draft.source,
        status: next.status ?? draft.status,
        from: (next.from !== undefined ? next.from : draft.from) || undefined,
        to: (next.to !== undefined ? next.to : draft.to) || undefined,
        interest: (next.interest !== undefined ? next.interest : draft.interest) || undefined,
      },
    });
  };

  const clearMatching = async () => {
    const filterLabel = describeFilter(search);
    if (
      !confirm(
        `Delete ${data.matchCount} message${data.matchCount === 1 ? "" : "s"} matching:\n${filterLabel}\n\nThis cannot be undone.`,
      )
    ) {
      return;
    }
    const result = await clearContactMessagesFn({
      data: {
        page: 1,
        pageSize: MESSAGE_PAGE_SIZE,
        source: search.source,
        status: search.status,
        from: search.from,
        to: search.to,
        interest: search.interest,
      } satisfies MessageListFilter,
    });
    setSelectedId(null);
    setMsg(`Deleted ${result.deleted} message${result.deleted === 1 ? "" : "s"}`);
    await router.invalidate();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages"
        description={`${data.unreadTotal} unread total · ${data.matchCount} match current filters`}
      />
      <StatusBanner message={msg} />

      <form
        className="rounded-md border border-border bg-card p-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters({ page: 1 });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block text-xs">
            <span className="text-muted-foreground">Type / source</span>
            <select
              className={`${fieldCls} mt-1`}
              value={draft.source}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  source: e.target.value as MessagesSearch["source"],
                })
              }
            >
              <option value="all">All sources</option>
              <option value="contact">Contact</option>
              <option value="partnerships">Partnerships</option>
            </select>
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">Marked as</span>
            <select
              className={`${fieldCls} mt-1`}
              value={draft.status}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  status: e.target.value as MessagesSearch["status"],
                })
              }
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">From date</span>
            <input
              type="date"
              className={`${fieldCls} mt-1`}
              value={draft.from}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">To date</span>
            <input
              type="date"
              className={`${fieldCls} mt-1`}
              value={draft.to}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">Interest</span>
            <select
              className={`${fieldCls} mt-1`}
              value={draft.interest}
              onChange={(e) => setDraft({ ...draft, interest: e.target.value })}
            >
              <option value="">All interests</option>
              {data.interests.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            Apply filters
          </button>
          <button
            type="button"
            className="rounded-sm border border-border px-3 py-1.5 text-xs"
            onClick={() => {
              setDraft({
                source: "all",
                status: "all",
                from: "",
                to: "",
                interest: "",
              });
              void navigate({
                search: {
                  page: 1,
                  source: "all",
                  status: "all",
                  from: undefined,
                  to: undefined,
                  interest: undefined,
                },
              });
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="rounded-sm border border-destructive/40 text-destructive px-3 py-1.5 text-xs ml-auto"
            disabled={data.matchCount === 0}
            onClick={() => void clearMatching()}
          >
            Clear matching ({data.matchCount})
          </button>
        </div>
      </form>

      {data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages match these filters.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-3">
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
              {data.items.map((m) => {
                const active = m.id === selectedId;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      className={`w-full text-left rounded-sm border p-3 transition-colors ${
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                      onClick={async () => {
                        setSelectedId(m.id);
                        setMsg(null);
                        if (m.isRead === 0) {
                          await markMessageReadFn({ data: { id: m.id, isRead: 1 } });
                          await router.invalidate();
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {m.isRead === 0 && (
                              <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                            )}
                            <span className="font-medium text-sm truncate">{m.name}</span>
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground truncate">
                            {m.interest}
                            {m.source === "partnerships" ? " · Partnerships" : ""}
                          </div>
                        </div>
                        <time className="text-[11px] text-muted-foreground shrink-0">
                          {formatWhen(m.createdAt)}
                        </time>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                        {m.message}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-sm border border-border px-2 py-1 disabled:opacity-40"
                  disabled={data.page <= 1}
                  onClick={() => applyFilters({ ...search, page: data.page - 1 })}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="rounded-sm border border-border px-2 py-1 disabled:opacity-40"
                  disabled={data.page >= data.totalPages}
                  onClick={() => applyFilters({ ...search, page: data.page + 1 })}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-5 min-h-[280px]">
            {selected ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl">{selected.name}</h2>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {selected.email}
                    </a>
                    {selected.phone && (
                      <div className="text-sm mt-0.5">
                        <a href={`tel:${selected.phone}`} className="text-primary hover:underline">
                          {selected.phone}
                        </a>
                      </div>
                    )}
                    {selected.organization && (
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {selected.organization}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-sm border border-border px-2 py-1">
                      {selected.interest}
                    </span>
                    <span className="rounded-sm border border-border px-2 py-1 capitalize">
                      {selected.source}
                    </span>
                  </div>
                </div>
                <time className="block text-xs text-muted-foreground">
                  {new Date(selected.createdAt).toLocaleString()}
                </time>
                <p className="text-sm leading-relaxed whitespace-pre-wrap border-t border-border pt-4">
                  {selected.message}
                </p>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(
                      `Re: ${selected.interest}`,
                    )}`}
                    className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    Reply by email
                  </a>
                  <button
                    type="button"
                    className="rounded-sm border border-border px-3 py-1.5 text-xs"
                    onClick={async () => {
                      await markMessageReadFn({
                        data: { id: selected.id, isRead: selected.isRead ? 0 : 1 },
                      });
                      setMsg(selected.isRead ? "Marked unread" : "Marked read");
                      await router.invalidate();
                    }}
                  >
                    Mark {selected.isRead ? "unread" : "read"}
                  </button>
                  <button
                    type="button"
                    className="rounded-sm text-destructive px-3 py-1.5 text-xs"
                    onClick={async () => {
                      if (!confirm("Delete this message?")) return;
                      await deleteContactMessageFn({ data: { id: selected.id } });
                      setSelectedId(null);
                      setMsg("Message deleted");
                      await router.invalidate();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a message to read it.</p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Tip: set filters first, then use Clear matching to delete only that subset (e.g. all read
        contact messages before a date).
      </p>
      <Link to="/admin" className="text-xs text-primary hover:underline">
        ← Dashboard
      </Link>
    </div>
  );
}

function describeFilter(search: MessagesSearch) {
  const parts = [
    `source=${search.source}`,
    `status=${search.status}`,
    search.from ? `from=${search.from}` : null,
    search.to ? `to=${search.to}` : null,
    search.interest ? `interest=${search.interest}` : null,
  ].filter(Boolean);
  return parts.join(", ");
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
