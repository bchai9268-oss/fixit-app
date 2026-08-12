import { getAdminSession } from "../../../../admin-auth";
import { getLineConnection } from "../../../../line";

export async function GET() {
  if (!(await getAdminSession())) return Response.json({ error: "กรุณาเข้าสู่ระบบแอดมิน" }, { status: 401 });
  return Response.json(await getLineConnection(), { headers: { "Cache-Control": "no-store" } });
}
