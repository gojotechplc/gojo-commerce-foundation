import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  changePasswordFn,
  getAdminMeFn,
} from "@/lib/admin.server";
import {
  AdminPageHeader,
  Field,
  SaveButton,
  StatusBanner,
  fieldCls,
} from "@/components/admin/form-helpers";

export const Route = createFileRoute("/admin/settings")({
  loader: () => getAdminMeFn(),
  component: SettingsPage,
});

function SettingsPage() {
  const me = Route.useLoaderData();
  const router = useRouter();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Admin account password."
      />
      {me?.forcePasswordChange && (
        <StatusBanner
          message="You are using the default password. Please change it before continuing."
          tone="err"
        />
      )}
      <StatusBanner message={msg} />
      <StatusBanner message={err} tone="err" />
      <div className="mb-6 text-sm">
        Username: <span className="font-medium">{me?.username}</span>
      </div>
      <form
        className="space-y-4 max-w-md"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg(null);
          setErr(null);
          if (newPassword !== confirm) {
            setErr("New passwords do not match");
            return;
          }
          setPending(true);
          try {
            const res = await changePasswordFn({
              data: { currentPassword, newPassword },
            });
            if (!res.ok) {
              setErr(res.error);
              return;
            }
            setMsg("Password updated.");
            setCurrent("");
            setNew("");
            setConfirm("");
            await router.invalidate();
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Failed");
          } finally {
            setPending(false);
          }
        }}
      >
        <Field label="Current password">
          <input
            type="password"
            className={fieldCls}
            value={currentPassword}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            className={fieldCls}
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
            required
            minLength={8}
          />
        </Field>
        <Field label="Confirm new password">
          <input
            type="password"
            className={fieldCls}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </Field>
        <SaveButton pending={pending}>Update password</SaveButton>
      </form>
    </div>
  );
}
