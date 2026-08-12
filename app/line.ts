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
  const token = channelToken();
  const to = defaultRecipient();
  if (!token) return { ok: false, error: "missing-token" };
  if (!to) return { ok: false, error: "missing-recipient" };
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to, messages: [{ type: "text", text: text.slice(0, 5000) }] }),
  });
  return response.ok ? { ok: true } : { ok: false, error: `LINE API ${response.status}` };
}
