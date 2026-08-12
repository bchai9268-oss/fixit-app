import { getAdminSession } from "../../../admin-auth";
import { getRepair, updateRepairDetails } from "../../../repairs";

export async function GET(_request: Request, { params }: { params: Promise<{ repairId: string }> }) {
  try {
    const { repairId } = await params;
    const repair = await getRepair(decodeURIComponent(repairId));
    if (!repair) return Response.json({ error: "ไม่พบงานซ่อม" }, { status: 404 });
    const { id, customerName, deviceType, deviceModel, symptoms, status, estimatedMin, estimatedMax, finalPrice, paymentStatus, history } = repair;
    return Response.json({ repair: { id, customerName, deviceType, deviceModel, symptoms, status, estimatedMin, estimatedMax, finalPrice, paymentStatus, history } });
  } catch (error) {
    console.error("get repair failed", error);
    return Response.json({ error: "ไม่สามารถโหลดข้อมูลงานซ่อมได้" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ repairId: string }> }) {
  if (!(await getAdminSession())) return Response.json({ error: "กรุณาเข้าสู่ระบบแอดมิน" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const priority = String(body.priority ?? "normal") as "urgent" | "normal" | "low";
  const paymentStatus = String(body.paymentStatus ?? "unpaid") as "unpaid" | "pending" | "paid";
  if (!["urgent", "normal", "low"].includes(priority) || !["unpaid", "pending", "paid"].includes(paymentStatus)) return Response.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const numberOrNull = (value: unknown) => value === "" || value == null ? null : Math.max(0, Number(value));
  const { repairId } = await params;
  const repair = await updateRepairDetails(decodeURIComponent(repairId), {
    priority, paymentStatus, estimatedMin: numberOrNull(body.estimatedMin), estimatedMax: numberOrNull(body.estimatedMax),
    finalPrice: numberOrNull(body.finalPrice), adminNote: String(body.adminNote ?? "").trim() || null,
  });
  return repair ? Response.json({ repair }) : Response.json({ error: "ไม่พบงานซ่อม" }, { status: 404 });
}
