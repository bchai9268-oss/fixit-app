import { linkCustomerLine, getRepair, searchRepair } from "../../../repairs";
import { replyLineText, verifyLineSignature } from "../../../line";

type LineEvent = { type?: string; replyToken?: string; source?: { userId?: string }; message?: { type?: string; text?: string } };

const statusLabels: Record<string, string> = {
  received: "รับเรื่องแล้ว",
  checking: "กำลังตรวจเช็ก/รออะไหล่",
  repairing: "กำลังซ่อม",
  completed: "ซ่อมเสร็จแล้ว",
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature") ?? "";
  if (!(await verifyLineSignature(body, signature))) return new Response("Invalid signature", { status: 401 });

  const payload = JSON.parse(body) as { events?: LineEvent[] };
  await Promise.all((payload.events ?? []).map(async (event) => {
    if (event.type !== "message" || event.message?.type !== "text" || !event.source?.userId || !event.replyToken) return;
    const text = event.message.text?.trim() ?? "";
    const digits = text.replace(/\D/g, "");
    const isPhone = /^\d[\d\s-]{7,13}\d$/.test(text) && digits.length >= 9 && digits.length <= 10;
    const isRepairId = /^REP-\d{6}-[A-Z0-9]{4}$/i.test(text);
    if (isPhone || isRepairId) {
      const repair = await searchRepair(isPhone ? digits : text);
      if (!repair) {
        await replyLineText(event.replyToken, "ไม่พบงานซ่อมจากข้อมูลนี้ กรุณาตรวจสอบเบอร์โทรหรือรหัสใบส่งซ่อมอีกครั้ง");
        return;
      }
      const status = statusLabels[repair.status] ?? repair.status;
      const price = repair.finalPrice ?? repair.estimatedMin;
      const statusUrl = new URL(`/repair/status/${encodeURIComponent(repair.id)}`, request.url).toString();
      await replyLineText(event.replyToken, `พบงานซ่อมล่าสุด\n#${repair.id}\nอุปกรณ์: ${repair.deviceModel}\nสถานะ: ${status}${price ? `\nราคา: ${price.toLocaleString("th-TH")} บาท` : ""}\nดูรายละเอียด: ${statusUrl}\n\nรับแจ้งเตือนอัตโนมัติ ส่ง: LINK ${repair.id} ตามด้วยเลขท้ายเบอร์โทร 4 หลัก`);
      return;
    }
    const match = text.match(/^(?:LINK|ผูก)\s+(REP-[A-Z0-9-]+)\s+(\d{4})$/i);
    if (!match) {
      await replyLineText(event.replyToken, "เช็กสถานะ: พิมพ์เบอร์โทรหรือรหัสใบส่งซ่อม\nตัวอย่าง: 0812345678 หรือ REP-260812-AB12\n\nรับแจ้งเตือนอัตโนมัติ: LINK รหัสงาน เลขท้ายเบอร์โทร 4 หลัก");
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
