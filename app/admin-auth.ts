import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

const SESSION_COOKIE = "fixit_admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
// Cloudflare Workers Web Crypto currently caps PBKDF2 at 100,000 iterations.
const PASSWORD_ITERATIONS = 100000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_SECONDS = 60 * 15;

type AdminRecord = {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  password_iterations: number;
  failed_login_attempts: number;
  locked_until: number | null;
};

export type AdminSession = { id: string; email: string; displayName: string };

function getDb() {
  if (!env.DB) throw new Error("Admin database is unavailable");
  return env.DB;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

async function hashPassword(password: string, saltHex: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = Uint8Array.from(saltHex.match(/.{1,2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function hasAdminAccount(): Promise<boolean> {
  const row = await getDb().prepare("SELECT 1 AS found FROM admin_users LIMIT 1").first<{ found: number }>();
  return Boolean(row?.found);
}

export async function isValidSetupToken(token: string): Promise<boolean> {
  const expected = typeof env.ADMIN_SETUP_TOKEN_HASH === "string" ? env.ADMIN_SETUP_TOKEN_HASH : "";
  if (!token || !expected) return false;
  return constantTimeEqual(await sha256(token), expected);
}

export async function setupInitialAdmin(token: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (await hasAdminAccount()) return { ok: false, error: "setup-complete" };
  if (!(await isValidSetupToken(token))) return { ok: false, error: "invalid-token" };
  if (password.length < 12) return { ok: false, error: "weak-password" };

  const email = typeof env.ADMIN_EMAIL === "string" ? env.ADMIN_EMAIL.trim().toLowerCase() : "";
  if (!email) return { ok: false, error: "missing-email" };

  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt, PASSWORD_ITERATIONS);
  const now = Math.floor(Date.now() / 1000);
  await getDb().prepare(
    "INSERT INTO admin_users (id, email, password_hash, password_salt, password_iterations, failed_login_attempts, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
  ).bind(crypto.randomUUID(), email, passwordHash, salt, PASSWORD_ITERATIONS, now).run();
  return { ok: true };
}

export async function loginAdmin(email: string, password: string): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await getDb().prepare(
    "SELECT id, email, password_hash, password_salt, password_iterations, failed_login_attempts, locked_until FROM admin_users WHERE email = ? LIMIT 1",
  ).bind(normalizedEmail).first<AdminRecord>();
  const now = Math.floor(Date.now() / 1000);

  if (!user) return { ok: false, error: "invalid-credentials" };
  if (user.locked_until && user.locked_until > now) return { ok: false, error: "locked" };

  const candidateHash = await hashPassword(password, user.password_salt, user.password_iterations);
  if (!constantTimeEqual(candidateHash, user.password_hash)) {
    const attempts = user.failed_login_attempts + 1;
    const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? now + LOCK_SECONDS : null;
    await getDb().prepare("UPDATE admin_users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?")
      .bind(lockedUntil ? 0 : attempts, lockedUntil, user.id).run();
    return { ok: false, error: lockedUntil ? "locked" : "invalid-credentials" };
  }

  await getDb().prepare("UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?").bind(user.id).run();
  const token = randomHex(32);
  const tokenHash = await sha256(token);
  await getDb().batch([
    getDb().prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").bind(now),
    getDb().prepare("INSERT INTO admin_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
      .bind(tokenHash, user.id, now + SESSION_SECONDS, now),
  ]);
  return { ok: true, token };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const row = await getDb().prepare(
    "SELECT u.id, u.email FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? LIMIT 1",
  ).bind(tokenHash, now).first<{ id: string; email: string }>();
  if (!row) return null;
  return { id: row.id, email: row.email, displayName: "ผู้ดูแลระบบ" };
}

export async function deleteAdminSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await getDb().prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await sha256(token)).run();
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearedSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function sessionCookieName(): string {
  return SESSION_COOKIE;
}
