"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is unstable for these routes. */

import { useEffect, useState } from "react";
import { commonText } from "../../../i18n";
import { useLanguage } from "../../../useLanguage";

type Job = {
  id: string; customerName: string; deviceType: string; deviceModel: string; symptoms: string[]; status: string;
  estimatedMin: number | null; estimatedMax: number | null; finalPrice: number | null; paymentStatus: "unpaid" | "pending" | "paid";
  history: Array<{ status: string; note: string | null; createdAt: number }>;
};

const stages = [
  { id: "received", th: { title: "รับเรื่องแล้ว", detail: "ร้านได้รับข้อมูลและเตรียมตรวจสอบอุปกรณ์" }, en: { title: "Request received", detail: "The shop has received your request and will inspect the device" } },
  { id: "checking", th: { title: "กำลังตรวจเช็ก", detail: "ช่างกำลังประเมินความเสียหายและอะไหล่" }, en: { title: "Inspection", detail: "A technician is assessing the damage and required parts" } },
  { id: "repairing", th: { title: "กำลังซ่อม", detail: "อุปกรณ์อยู่ระหว่างดำเนินการซ่อม" }, en: { title: "Repair in progress", detail: "Your device is currently being repaired" } },
  { id: "completed", th: { title: "เสร็จสิ้น", detail: "งานซ่อมเสร็จแล้วและพร้อมรับเครื่อง" }, en: { title: "Completed", detail: "The repair is complete and the device is ready for collection" } },
] as const;

const copy = {
  th: { status: "สถานะงานซ่อม", owner: "เจ้าของงานซ่อม", waitingPrice: "รอประเมินราคา", current: "สถานะปัจจุบัน", askLine: "สอบถามงานซ่อมผ่าน LINE", linkLine: "รับแจ้งเตือนอัตโนมัติ: เพิ่มเพื่อนแล้วส่ง LINK รหัสงาน และเลขท้ายเบอร์โทร 4 หลัก", loadError: "ไม่สามารถโหลดข้อมูลงานซ่อมได้", loading: "กำลังโหลดสถานะงานซ่อม...", payment: "ชำระค่าซ่อม", pending: "กำลังตรวจสอบการชำระเงิน", paid: "ชำระเงินแล้ว" },
  en: { status: "Repair status", owner: "Repair owner", waitingPrice: "Waiting for estimate", current: "Current status", askLine: "Ask about this repair on LINE", linkLine: "For automatic updates, add the account and send LINK, your repair ID, and the last 4 phone digits", loadError: "Unable to load this repair job", loading: "Loading repair status...", payment: "Pay repair fee", pending: "Payment is being reviewed", paid: "Payment received" },
} as const;

export default function RepairStatusClient({ repairId }: { repairId: string }) {
  const { language, toggleLanguage } = useLanguage();
  const text = copy[language];
  const [job, setJob] = useState<Job | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/repairs/${encodeURIComponent(repairId)}`).then(async (response) => {
      const data = await response.json() as { repair?: Job };
      if (!response.ok || !data.repair) throw new Error("not-found");
      setJob(data.repair);
    }).catch(() => setFailed(true));
  }, [repairId]);

  const languageButton = <button className="flow-language-toggle" type="button" onClick={toggleLanguage} aria-label={commonText[language].languageLabel}>{commonText[language].languageButton}</button>;
  if (failed) return <main className="flow-page"><header className="flow-header"><a href="/">←</a><strong>FixIt Online</strong>{languageButton}</header><section className="repair-complete"><span>!</span><h1>{text.loadError}</h1><a href="/">{commonText[language].backHome}</a></section></main>;
  if (!job) return <main className="flow-page"><header className="flow-header"><a href="/">←</a><strong>FixIt Online</strong>{languageButton}</header><p className="loading-state">{text.loading}</p></main>;

  const current = Math.max(0, stages.findIndex((stage) => stage.id === job.status));
  const estimated = job.estimatedMin ? `${job.estimatedMin.toLocaleString(language === "th" ? "th-TH" : "en-US")}${job.estimatedMax && job.estimatedMax !== job.estimatedMin ? ` – ${job.estimatedMax.toLocaleString(language === "th" ? "th-TH" : "en-US")}` : ""} ${language === "th" ? "บาท" : "THB"}` : text.waitingPrice;
  const price = job.finalPrice ? `${job.finalPrice.toLocaleString(language === "th" ? "th-TH" : "en-US")} ${language === "th" ? "บาท" : "THB"}` : estimated;

  return <main className="flow-page status-page">
    <header className="flow-header"><a href="/">←</a><strong>{text.status} #{job.id}</strong>{languageButton}</header>
    <section className="status-device"><span>{job.deviceType.includes("โทรศัพท์") ? "📱" : "💻"}</span><div><h1>{job.deviceModel}</h1><p>{text.owner}: {job.customerName}</p></div><strong>{price}</strong></section>
    <section className="status-timeline">{stages.map((stage, index) => { const stageText = stage[language]; const history = job.history.find((item) => item.status === stage.id); const done = index < current; const active = index === current; return <article className={done ? "done" : active ? "current" : ""} key={stage.id}><i>{done ? "✓" : active ? "●" : ""}</i><div><header><h2>{stageText.title}</h2>{history && <time>{new Date(history.createdAt * 1000).toLocaleString(language === "th" ? "th-TH" : "en-US", { dateStyle: "medium", timeStyle: "short" })}</time>}</header><p>{language === "th" && history?.note ? history.note : stageText.detail}</p>{active && <small>{text.current}</small>}</div></article>; })}</section>
    <div className="status-actions">{job.finalPrice && job.paymentStatus === "unpaid" && <a className="primary-action" href={`/payment?repairId=${encodeURIComponent(job.id)}`}>{text.payment}</a>}{job.paymentStatus === "pending" && <span>{text.pending}</span>}{job.paymentStatus === "paid" && <span className="paid">✓ {text.paid}</span>}<a className="line-help" href="/api/line/chat" target="_blank" rel="noreferrer">{text.askLine}</a><small>{text.linkLine}<br /><b>LINK {job.id} 1234</b></small></div>
  </main>;
}
