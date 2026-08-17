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
    return crypto.subtle.verify("HMAC", key, decodeBase64(signature).buffer as ArrayBuffer, new TextEncoder().encode(body));
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

export async function installDefaultRichMenu(origin: string): Promise<{ ok: boolean; error?: string; richMenuId?: string }> {
  const token = channelToken();
  if (!token) return { ok: false, error: "missing-token" };
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const width = 1920;
  const height = 819;
  const cellWidths = [384, 384, 384, 384, 384];
  const links = ["/repair/new?device=phone", "/#track", "/#track", "/payment", "/api/line/chat"];
  let x = 0;
  const areas = cellWidths.map((cellWidth, index) => {
    const area = { bounds: { x, y: 0, width: cellWidth, height }, action: { type: "uri", label: ["แจ้งซ่อม", "เช็กสถานะ", "อนุมัติราคา", "ชำระเงิน", "ติดต่อร้าน"][index], uri: new URL(links[index], origin).toString() } };
    x += cellWidth;
    return area;
  });
  const lineError = async (response: Response, step: string) => {
    const detail = (await response.text()).slice(0, 500);
    return `${step}:${response.status}${detail ? ` ${detail}` : ""}`;
  };
  const create = await fetch("https://api.line.me/v2/bot/richmenu", { method: "POST", headers, body: JSON.stringify({ size: { width, height }, selected: true, name: "FixIt Online Main Menu", chatBarText: "เมนู FixIt", areas }) });
  if (!create.ok) return { ok: false, error: await lineError(create, "create") };
  const { richMenuId } = await create.json() as { richMenuId: string };
  const removeIncompleteMenu = () => fetch(`https://api.line.me/v2/bot/richmenu/${encodeURIComponent(richMenuId)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined);
  const image = await env.ASSETS.fetch(new Request(new URL("/line-rich-menu.jpg", origin)));
  if (!image.ok) { await removeIncompleteMenu(); return { ok: false, error: `image-unavailable:${image.status}`, richMenuId }; }
  const upload = await fetch(`https://api-data.line.me/v2/bot/richmenu/${encodeURIComponent(richMenuId)}/content`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/jpeg" }, body: await image.arrayBuffer() });
  if (!upload.ok) { const error = await lineError(upload, "upload"); await removeIncompleteMenu(); return { ok: false, error, richMenuId }; }
  const setDefault = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${encodeURIComponent(richMenuId)}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  return setDefault.ok ? { ok: true, richMenuId } : { ok: false, error: await lineError(setDefault, "default"), richMenuId };
}
