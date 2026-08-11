import { getRepair } from "../../../repairs";

export async function GET(_request: Request, { params }: { params: Promise<{ repairId: string }> }) {
  try {
    const { repairId } = await params;
    const repair = await getRepair(decodeURIComponent(repairId));
    return repair ? Response.json({ repair }) : Response.json({ error: "ไม่พบงานซ่อม" }, { status: 404 });
  } catch (error) {
    console.error("get repair failed", error);
    return Response.json({ error: "ไม่สามารถโหลดข้อมูลงานซ่อมได้" }, { status: 500 });
  }
}
