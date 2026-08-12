import { env } from "cloudflare:workers";
import { createPayment } from "../../payments";
import { getRepair } from "../../repairs";

const allowedTypes = new Set(["image/jpeg", "image/png"]);
const maxSize = 5 * 1024 * 1024;

function extension(type: string) { return type === "image/png" ? "png" : "jpg"; }

export async function POST(request: Request) {
  const form = await request.formData();
  const repairId = String(form.get("repairId") ?? "").trim();
  const phoneSuffix = String(form.get("phoneSuffix") ?? "").replace(/\D/g, "");
  const method = String(form.get("method") ?? "") as "qr" | "bank";
  const slip = form.get("slip");
  if (!repairId || phoneSuffix.length !== 4 || !["qr", "bank"].includes(method) || !(slip instanceof File)) return Response.json({ error: "invalid-input" }, { status: 400 });
  if (!allowedTypes.has(slip.type) || slip.size <= 0 || slip.size > maxSize) return Response.json({ error: "invalid-file" }, { status: 400 });

  const repair = await getRepair(repairId);
  if (!repair || !repair.phone.replace(/\D/g, "").endsWith(phoneSuffix)) return Response.json({ error: "invalid-verification" }, { status: 403 });
  if (!repair.finalPrice || repair.finalPrice <= 0) return Response.json({ error: "price-not-ready" }, { status: 409 });
  if (repair.paymentStatus !== "unpaid") return Response.json({ error: "payment-already-submitted" }, { status: 409 });
  if (!env.UPLOADS) return Response.json({ error: "storage-unavailable" }, { status: 503 });

  const key = `payment-slips/${repair.id}/${crypto.randomUUID()}.${extension(slip.type)}`;
  await env.UPLOADS.put(key, await slip.arrayBuffer(), { httpMetadata: { contentType: slip.type }, customMetadata: { repairId: repair.id } });
  try {
    const payment = await createPayment({ repairId: repair.id, amount: repair.finalPrice, method, slipKey: key, originalName: slip.name.slice(0, 180), contentType: slip.type });
    return Response.json({ payment }, { status: 201 });
  } catch (error) {
    await env.UPLOADS.delete(key);
    console.error("create payment failed", error);
    return Response.json({ error: "save-failed" }, { status: 500 });
  }
}

