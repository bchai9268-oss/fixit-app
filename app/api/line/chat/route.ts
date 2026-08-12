import { getLineConnection } from "../../../line";

export async function GET(request: Request) {
  const connection = await getLineConnection();
  const target = connection.basicId ? `https://line.me/R/ti/p/${encodeURIComponent(connection.basicId)}` : "https://line.me";
  return Response.redirect(new URL(target, request.url), 302);
}
