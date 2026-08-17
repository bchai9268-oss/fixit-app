import { respondToQuote } from "../../../../repairs";

export async function PATCH(request: Request, { params }: { params: Promise<{ repairId: string }> }) {
  const body = await request.json() as Record<string, unknown>;
  const decision = String(body.decision ?? "");
  const phoneSuffix = String(body.phoneSuffix ?? "").replace(/\D/g, "");
  if (!["approved", "rejected"].includes(decision) || phoneSuffix.length !== 4) return Response.json({ error: "ข้อมูลยืนยันไม่ถูกต้อง" }, { status: 400 });
  const { repairId } = await params;
  const repair = await respondToQuote(decodeURIComponent(repairId), decision as "approved" | "rejected", phoneSuffix);
  return repair ? Response.json({ repair }) : Response.json({ error: "เลขท้ายเบอร์โทรไม่ถูกต้อง" }, { status: 403 });
}
