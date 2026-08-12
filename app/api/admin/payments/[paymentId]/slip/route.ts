import { env } from "cloudflare:workers";
import { getAdminSession } from "../../../../../admin-auth";
import { getPayment } from "../../../../../payments";

export async function GET(_request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  if (!(await getAdminSession())) return new Response("Unauthorized", { status: 401 });
  const { paymentId } = await params;
  const payment = await getPayment(decodeURIComponent(paymentId));
  if (!payment || !env.UPLOADS) return new Response("Not found", { status: 404 });
  const object = await env.UPLOADS.get(payment.slipKey);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": payment.contentType, "Content-Disposition": `inline; filename="payment-slip.${payment.contentType === "image/png" ? "png" : "jpg"}"`, "Cache-Control": "private, no-store" } });
}
