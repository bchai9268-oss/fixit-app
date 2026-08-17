import { getAdminSession } from "../../../../admin-auth";
import { moderateReview } from "../../../../repairs";

export async function PATCH(request: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  if (!(await getAdminSession())) return Response.json({ error: "กรุณาเข้าสู่ระบบแอดมิน" }, { status: 401 });
  const body = await request.json() as { status?: string };
  if (!body.status || !["published", "rejected"].includes(body.status)) return Response.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
  const { reviewId } = await params;
  await moderateReview(decodeURIComponent(reviewId), body.status as "published" | "rejected");
  return Response.json({ ok: true });
}
