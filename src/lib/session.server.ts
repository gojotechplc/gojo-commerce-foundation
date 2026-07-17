import { eq, lt } from "drizzle-orm";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { ensureSeeded, getDb } from "./db.server";
import { adminUsers, sessions } from "../../db/schema";
import { hashPassword, verifyPassword } from "./password.server";

export const SESSION_COOKIE = "gojo_admin_session";
const SESSION_DAYS = 7;

function expiresAtIso(days = SESSION_DAYS) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export type AdminSession = {
  sessionId: string;
  userId: number;
  username: string;
  forcePasswordChange: boolean;
};

export async function createSession(userId: number): Promise<string> {
  await ensureSeeded();
  const db = getDb();
  const id = crypto.randomUUID();
  db.insert(sessions)
    .values({ id, userId, expiresAt: expiresAtIso() })
    .run();
  setCookie(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
  return id;
}

export async function destroySession(): Promise<void> {
  await ensureSeeded();
  const db = getDb();
  const id = getCookie(SESSION_COOKIE);
  if (id) {
    db.delete(sessions).where(eq(sessions.id, id)).run();
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  await ensureSeeded();
  const db = getDb();
  const id = getCookie(SESSION_COOKIE);
  if (!id) return null;

  // prune expired
  db.delete(sessions).where(lt(sessions.expiresAt, new Date().toISOString())).run();

  const row = db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      username: adminUsers.username,
      forcePasswordChange: adminUsers.forcePasswordChange,
    })
    .from(sessions)
    .innerJoin(adminUsers, eq(sessions.userId, adminUsers.id))
    .where(eq(sessions.id, id))
    .get();

  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    db.delete(sessions).where(eq(sessions.id, id)).run();
    deleteCookie(SESSION_COOKIE, { path: "/" });
    return null;
  }

  return {
    sessionId: row.sessionId,
    userId: row.userId,
    username: row.username,
    forcePasswordChange: row.forcePasswordChange === 1,
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<{ ok: true; forcePasswordChange: boolean } | { ok: false; error: string }> {
  await ensureSeeded();
  const db = getDb();
  const user = db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username.trim()))
    .get();

  if (!user) return { ok: false, error: "Invalid username or password" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, error: "Invalid username or password" };

  await createSession(user.id);
  return { ok: true, forcePasswordChange: user.forcePasswordChange === 1 };
}

export async function changeAdminPassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await ensureSeeded();
  const db = getDb();
  const user = db.select().from(adminUsers).where(eq(adminUsers.id, userId)).get();
  if (!user) return { ok: false, error: "User not found" };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { ok: false, error: "Current password is incorrect" };

  if (newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters" };
  }

  const passwordHash = await hashPassword(newPassword);

  db.update(adminUsers)
    .set({
      passwordHash,
      forcePasswordChange: 0,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(adminUsers.id, userId))
    .run();

  return { ok: true };
}

export async function getAdminUserById(userId: number) {
  await ensureSeeded();
  return getDb().select().from(adminUsers).where(eq(adminUsers.id, userId)).get();
}
