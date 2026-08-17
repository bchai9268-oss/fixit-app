import { getAdminSession } from "../../../../admin-auth";
import { installDefaultRichMenu } from "../../../../line";

export async function POST(request: Request) {
  if (!(await getAdminSession())) return Response.json({ error: "กรุณาเข้าสู่ระบบแอดมิน" }, { status: 401 });
  const result = await installDefaultRichMenu(new URL(request.url).origin);
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
