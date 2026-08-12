import { env } from "cloudflare:workers";

export type LineConnection = {
  tokenConfigured: boolean;
  connected: boolean;
  recipientConfigured: boolean;
  displayName?: string;
  basicId?: string;
  error?: string;
};

function channelToken(): string {
  return typeof env.LINE_CHANNEL_ACCESS_TOKEN === "string" ? env.LINE_CHANNEL_ACCESS_TOKEN.trim() : "";
}

function defaultRecipient(): string {
  return typeof env.LINE_DEFAULT_RECIPIENT === "string" ? env.LINE_DEFAULT_RECIPIENT.trim() : "";
}

function channelSecret(): string {
  return typeof env.LINE_CHANNEL_SECRET === "string" ? env.LINE_CHANNEL_SECRET.trim() : "";
}

export async function getLineConnection(): Promise<LineConnection> {
  const token = channelToken();
  const recipientConfigured = Boolean(defaultRecipient());
  if (!token) return { tokenConfigured: false, connected: false, recipientConfigured };
  try {
    const response = await fetch("https://api.line.me/v2/bot/info", { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return { tokenConfigured: true, connected: false, recipientConfigured, error: `LINE API ${response.status}` };
    const profile = await response.json() as { displayName?: string; basicId?: string };
    return { tokenConfigured: true, connected: true, recipientConfigured, displayName: profile.displayName, basicId: profile.basicId };
  } catch {
    return { tokenConfigured: true, connected: false, recipientConfigured, error: "ไม่สามารถติดต่อ LINE API ได้" };
  }
}

export async function sendLineText(text: string): Promise<{ ok: boolean; error?: string }> {
  const to = defaultRecipient();
  if (!to) return { ok: false, error: "missing-recipient" };
  return sendLineTextTo(to, text);
}

export async function sendLineTextTo(to: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const token = channelToken();
  if (!token) return { ok: false, error: "missing-token" };
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to, messages: [{ type: "text", text: text.slice(0, 5000) }] }),
  });
  return response.ok ? { ok: true } : { ok: false, error: `LINE API ${response.status}` };
}

export async function replyLineText(replyToken: string, text: string): Promise<boolean> {
  const token = channelToken();
  if (!token) return false;
  const response = await fetch("https://api.line.me/v2/bot/message/reply", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ replyToken, messages: [{ type: "text", text: text.slice(0, 5000) }] }) });
  return response.ok;
}

function decodeBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

export async function verifyLineSignature(body: string, signature: string): Promise<boolean> {
  const secret = channelSecret();
  if (!secret || !signature) return false;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    return crypto.subtle.verify("HMAC", key, decodeBase64(signature), new TextEncoder().encode(body));
  } catch {
    return false;
  }
}

const statusMessages: Record<string, string> = {
  received: "ร้านได้รับเรื่องซ่อมแล้ว / Repair request received",
  checking: "ช่างกำลังตรวจเช็กอุปกรณ์ / Device inspection in progress",
  repairing: "อุปกรณ์กำลังซ่อม / Repair in progress",
  completed: "งานซ่อมเสร็จสิ้นแล้ว / Repair completed",
};

export async function notifyRepairStatus(repair: { id: string; deviceModel: string; status: string; lineUserId: string | null }) {
  if (!repair.lineUserId) return { ok: false, error: "not-linked" };
  const status = statusMessages[repair.status] ?? repair.status;
  return sendLineTextTo(repair.lineUserId, `FixIt Online\n#${repair.id}\n${repair.deviceModel}\n${status}`);
}
