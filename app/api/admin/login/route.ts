import { loginAdmin, sessionCookie } from "../../../admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return redirectTo(request, "/admin?error=required");

  const result = await loginAdmin(email, password);
  if (!result.ok) return redirectTo(request, `/admin?error=${encodeURIComponent(result.error)}`);
  return redirectTo(request, "/admin", sessionCookie(result.token));
}

function redirectTo(request: Request, path: string, cookie?: string) {
  const headers = new Headers({ Location: new URL(path, request.url).toString(), "Cache-Control": "no-store" });
  if (cookie) headers.set("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}
