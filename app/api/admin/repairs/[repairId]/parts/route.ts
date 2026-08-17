import { getAdminSession } from "../../../../../admin-auth";
import { replaceRepairParts } from "../../../../../repairs";

export async function PUT(request: Request, { params }: { params: Promise<{ repairId: string }> }) {
  if (!(await getAdminSession())) return Response.json({ error: "กรุณาเข้าสู่ระบบแอดมิน" }, { status: 401 });
  const body = await request.json() as { parts?: Array<Record<string, unknown>> };
  const parts = (body.parts ?? []).map((part) => ({
    name: String(part.name ?? "").trim(),
    quantity: Math.max(1, Math.min(99, Number(part.quantity) || 1)),
    unitPrice: Math.max(0, Number(part.unitPrice) || 0),
    warrantyDays: Math.max(0, Math.min(1095, Number(part.warrantyDays) || 0)),
  })).filter((part) => part.name).slice(0, 30);
  const { repairId } = await params;
  const repair = await replaceRepairParts(decodeURIComponent(repairId), parts);
  return repair ? Response.json({ repair }) : Response.json({ error: "ไม่พบงานซ่อม" }, { status: 404 });
}
