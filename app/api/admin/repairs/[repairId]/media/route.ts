import { env } from "cloudflare:workers";
import { getAdminSession } from "../../../../../admin-auth";
import { addRepairMedia, getRepair } from "../../../../../repairs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request, { params }: { params: Promise<{ repairId: string }> }) {
  if (!(await getAdminSession())) return Response.json({ error: "กรุณาเข้าสู่ระบบแอดมิน" }, { status: 401 });
  const { repairId: encodedId } = await params;
  const repairId = decodeURIComponent(encodedId);
  if (!(await getRepair(repairId))) return Response.json({ error: "ไม่พบงานซ่อม" }, { status: 404 });
  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "before") as "before" | "after" | "part";
  const caption = String(form.get("caption") ?? "").trim().slice(0, 160) || null;
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > 8 * 1024 * 1024 || !["before", "after", "part"].includes(kind)) {
    return Response.json({ error: "รองรับ JPG, PNG หรือ WebP ขนาดไม่เกิน 8 MB" }, { status: 400 });
  }
  const key = `repairs/${repairId}/${crypto.randomUUID()}`;
  await env.UPLOADS.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { originalName: file.name } });
  const media = await addRepairMedia({ repairId, kind, objectKey: key, originalName: file.name, contentType: file.type, caption });
  return Response.json({ media }, { status: 201 });
}
