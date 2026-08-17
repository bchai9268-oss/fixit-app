import { createReview } from "../../../../repairs";

export async function POST(request: Request, { params }: { params: Promise<{ repairId: string }> }) {
  const body = await request.json() as Record<string, unknown>;
  const rating = Number(body.rating);
  const phoneSuffix = String(body.phoneSuffix ?? "").replace(/\D/g, "");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || phoneSuffix.length !== 4) return Response.json({ error: "กรุณากรอกคะแนนและเลขท้ายเบอร์โทรให้ถูกต้อง" }, { status: 400 });
  try {
    const { repairId } = await params;
    const review = await createReview(decodeURIComponent(repairId), rating, String(body.comment ?? "").trim().slice(0, 1000) || null, phoneSuffix);
    return review ? Response.json({ review }, { status: 201 }) : Response.json({ error: "ส่งรีวิวไม่ได้ กรุณาตรวจสอบข้อมูลงาน" }, { status: 403 });
  } catch (error) {
    console.error("create review failed", error);
    return Response.json({ error: "งานนี้มีรีวิวแล้ว" }, { status: 409 });
  }
}
