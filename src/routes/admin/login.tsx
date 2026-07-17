import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getAdminMeFn, loginAdminFn } from "@/lib/admin.server";
import { fieldCls } from "@/components/admin/form-helpers";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    const me = await getAdminMeFn();
    if (me) {
      throw redirect({
        to: me.forcePasswordChange ? "/admin/settings" : "/admin",
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-8">
        <div className="font-display text-2xl">Admin login</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Gojo Solutions content management
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            setError(null);
            try {
              const res = await loginAdminFn({ data: { username, password } });
              if (!res.ok) {
                setError(res.error);
                return;
              }
              await navigate({
                to: res.forcePasswordChange ? "/admin/settings" : "/admin",
              });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Login failed");
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Username</span>
            <input
              className={fieldCls}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Password</span>
            <input
              type="password"
              className={fieldCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-forest disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
