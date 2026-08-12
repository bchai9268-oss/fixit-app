import { linkCustomerLine, getRepair } from "../../../repairs";
import { replyLineText, verifyLineSignature } from "../../../line";

type LineEvent = { type?: string; replyToken?: string; source?: { userId?: string }; message?: { type?: string; text?: string } };

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature") ?? "";
  if (!(await verifyLineSignature(body, signature))) return new Response("Invalid signature", { status: 401 });

  const payload = JSON.parse(body) as { events?: LineEvent[] };
  await Promise.all((payload.events ?? []).map(async (event) => {
    if (event.type !== "message" || event.message?.type !== "text" || !event.source?.userId || !event.replyToken) return;
    const text = event.message.text?.trim() ?? "";
    const match = text.match(/^(?:LINK|ผูก)\s+(REP-[A-Z0-9-]+)\s+(\d{4})$/i);
    if (!match) {
      await replyLineText(event.replyToken, "หากต้องการผูกงานซ่อม กรุณาส่ง: LINK รหัสงาน เลขท้ายเบอร์โทร4หลัก\nExample: LINK REP-260812-AB12 1234");
      return;
    }
    const repair = await getRepair(match[1]);
    if (!repair || !repair.phone.replace(/\D/g, "").endsWith(match[2])) {
      await replyLineText(event.replyToken, "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบรหัสงานและเลขท้ายเบอร์โทร / Verification failed");
      return;
    }
    await linkCustomerLine(repair.customerId, event.source.userId);
    await replyLineText(event.replyToken, `เชื่อมต่อ LINE กับงาน #${repair.id} สำเร็จแล้ว\nLINE linked to repair #${repair.id}`);
  }));
  return new Response("OK");
}
