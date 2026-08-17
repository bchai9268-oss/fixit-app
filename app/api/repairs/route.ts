import { createRepair } from "../../repairs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").replace(/\D/g, "");
    const deviceType = String(body.deviceType ?? "").trim();
    const deviceModel = String(body.deviceModel ?? "").trim();
    const symptoms = Array.isArray(body.symptoms) ? body.symptoms.map(String).filter(Boolean) : [];
    const priority = String(body.priority ?? "normal");
    if (!name || phone.length < 9 || !deviceType || !deviceModel || symptoms.length === 0 || !["normal", "urgent"].includes(priority)) {
      return Response.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }
    const repair = await createRepair({
      name, phone, deviceType, deviceModel, symptoms,
      email: String(body.email ?? "").trim(), note: String(body.note ?? "").trim(), priority: priority as "normal" | "urgent",
    });
    return Response.json({ repair }, { status: 201 });
  } catch (error) {
    console.error("create repair failed", error);
    return Response.json({ error: "ไม่สามารถบันทึกงานซ่อมได้ในขณะนี้" }, { status: 500 });
  }
}
