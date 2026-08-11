import { searchRepair } from "../../../repairs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!query.trim()) return Response.json({ error: "กรุณากรอกหมายเลขงานหรือเบอร์โทร" }, { status: 400 });
  try {
    const repair = await searchRepair(query);
    return repair ? Response.json({ repair }) : Response.json({ error: "ไม่พบงานซ่อม" }, { status: 404 });
  } catch (error) {
    console.error("search repair failed", error);
    return Response.json({ error: "ไม่สามารถค้นหางานซ่อมได้ในขณะนี้" }, { status: 500 });
  }
}
