import { getAdminSession } from "../../../../admin-auth";
import { reviewPayment } from "../../../../payments";

export async function PATCH(request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  if (!(await getAdminSession())) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as { status?: string };
  if (body.status !== "paid" && body.status !== "rejected") return Response.json({ error: "invalid-status" }, { status: 400 });
  const { paymentId } = await params;
  const payment = await reviewPayment(decodeURIComponent(paymentId), body.status);
  return payment ? Response.json({ payment }) : Response.json({ error: "not-found" }, { status: 404 });
}

