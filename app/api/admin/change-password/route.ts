import { changeAdminPassword, clearedSessionCookie } from "../../../admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const currentPassword = String(form.get("currentPassword") ?? "");
  const newPassword = String(form.get("newPassword") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");
  if (newPassword !== confirmPassword) return redirect(request, "/admin?settings=1&password=mismatch");
  const result = await changeAdminPassword(currentPassword, newPassword);
  if (!result.ok) return redirect(request, `/admin?settings=1&password=${encodeURIComponent(result.error ?? "failed")}`);
  return redirect(request, "/admin?password=changed", clearedSessionCookie());
}

function redirect(request: Request, path: string, cookie?: string) {
  const headers = new Headers({ Location: new URL(path, request.url).toString(), "Cache-Control": "no-store" });
  if (cookie) headers.set("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}
