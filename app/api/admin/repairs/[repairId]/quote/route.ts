import { getAdminSession } from "../../../../../admin-auth";
import { upsertRepairQuote } from "../../../../../repairs";

export async function PUT(request: Request, { params }: { params: Promise<{ repairId: string }> }) {
  if (!(await getAdminSession())) return Response.json({ error: "กรุณาเข้าสู่ระบบแอดมิน" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const laborAmount = Math.max(0, Number(body.laborAmount) || 0);
  const { repairId } = await params;
  const repair = await upsertRepairQuote(decodeURIComponent(repairId), laborAmount, String(body.note ?? "").trim().slice(0, 500) || null);
  return repair ? Response.json({ repair }) : Response.json({ error: "ไม่พบงานซ่อม" }, { status: 404 });
}
