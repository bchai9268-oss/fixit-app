import { setupInitialAdmin } from "../../../admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");
  if (password !== confirmPassword) return redirectTo(request, token, "mismatch");
  const result = await setupInitialAdmin(token, password);
  if (!result.ok) return redirectTo(request, token, result.error ?? "failed");
  return new Response(null, { status: 303, headers: { Location: new URL("/admin?setup=complete", request.url).toString(), "Cache-Control": "no-store" } });
}

function redirectTo(request: Request, token: string, error: string) {
  const path = `/admin/setup?token=${encodeURIComponent(token)}&error=${encodeURIComponent(error)}`;
  return new Response(null, { status: 303, headers: { Location: new URL(path, request.url).toString(), "Cache-Control": "no-store" } });
}
