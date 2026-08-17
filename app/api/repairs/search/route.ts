import { searchRepair } from "../../../repairs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!query.trim()) return Response.json({ error: "กรุณากรอกหมายเลขงานหรือเบอร์โทร" }, { status: 400 });
  const value = query.trim();
  const digits = value.replace(/\D/g, "");
  const validPhone = /^\d[\d\s-]{7,13}\d$/.test(value) && digits.length >= 9 && digits.length <= 10;
  const validRepairId = /^REP-\d{6}-[A-Z0-9]{4}$/i.test(value);
  if (!validPhone && !validRepairId) return Response.json({ error: "รูปแบบเบอร์โทรหรือรหัสงานไม่ถูกต้อง" }, { status: 400 });
  try {
    const repair = await searchRepair(query);
    return repair ? Response.json({ repair: { id: repair.id } }) : Response.json({ error: "ไม่พบงานซ่อม" }, { status: 404 });
  } catch (error) {
    console.error("search repair failed", error);
    return Response.json({ error: "ไม่สามารถค้นหางานซ่อมได้ในขณะนี้" }, { status: 500 });
  }
}
