import { getAdminSession } from "../../../../admin-auth";
import { sendLineText } from "../../../../line";

export async function POST() {
  if (!(await getAdminSession())) return Response.json({ error: "กรุณาเข้าสู่ระบบแอดมิน" }, { status: 401 });
  const result = await sendLineText("FixIt Online เชื่อมต่อระบบแจ้งเตือน LINE สำเร็จแล้ว");
  return result.ok ? Response.json({ ok: true }) : Response.json(result, { status: result.error === "missing-recipient" ? 409 : 502 });
}
