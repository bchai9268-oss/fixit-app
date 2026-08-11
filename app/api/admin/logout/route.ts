import { clearedSessionCookie, deleteAdminSession, sessionCookieName } from "../../../admin-auth";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookieName()}=`))?.split("=").slice(1).join("=");
  await deleteAdminSession(token);
  return new Response(null, { status: 303, headers: { Location: new URL("/admin", request.url).toString(), "Set-Cookie": clearedSessionCookie(), "Cache-Control": "no-store" } });
}
