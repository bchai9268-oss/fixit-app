import { getAdminSession } from "../../../../admin-auth";
import { repairStatuses, updateRepairStatus } from "../../../../repairs";

export async function PATCH(request: Request, { params }: { params: Promise<{ repairId: string }> }) {
  if (!(await getAdminSession())) return Response.json({ error: "กรุณาเข้าสู่ระบบแอดมิน" }, { status: 401 });
  const body = await request.json() as { status?: string; note?: string };
  if (!body.status || !repairStatuses.includes(body.status as (typeof repairStatuses)[number])) {
    return Response.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
  }
  try {
    const { repairId } = await params;
    const repair = await updateRepairStatus(decodeURIComponent(repairId), body.status as (typeof repairStatuses)[number], body.note);
    return repair ? Response.json({ repair }) : Response.json({ error: "ไม่พบงานซ่อม" }, { status: 404 });
  } catch (error) {
    console.error("update repair status failed", error);
    return Response.json({ error: "ไม่สามารถอัปเดตสถานะได้" }, { status: 500 });
  }
}
