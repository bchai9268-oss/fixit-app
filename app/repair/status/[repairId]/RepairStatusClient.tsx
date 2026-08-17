"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is unstable for these routes. */

import { useEffect, useState } from "react";
import { commonText } from "../../../i18n";
import { useLanguage } from "../../../useLanguage";

type Job = {
  id: string; customerName: string; deviceType: string; deviceModel: string; symptoms: string[]; status: string;
  estimatedMin: number | null; estimatedMax: number | null; finalPrice: number | null; paymentStatus: "unpaid" | "pending" | "paid";
  history: Array<{ status: string; note: string | null; createdAt: number }>;
  media: Array<{ id: string; kind: "before" | "after" | "part"; caption: string | null; createdAt: number }>;
  parts: Array<{ id: string; name: string; quantity: number; unitPrice: number; warrantyDays: number }>;
  quote: { laborAmount: number; partsAmount: number; totalAmount: number; note: string | null; status: "pending" | "approved" | "rejected"; respondedAt: number | null } | null;
  warranty: { warrantyNumber: string; startsAt: number; endsAt: number; terms: string } | null;
  review: { id: string; rating: number; comment: string | null; status: "pending" | "published" | "rejected"; createdAt: number } | null;
};

const stages = [
  { id: "received", th: { title: "รับเรื่องแล้ว", detail: "ร้านได้รับข้อมูลและเตรียมตรวจสอบอุปกรณ์" }, en: { title: "Request received", detail: "The shop has received your request and will inspect the device" } },
  { id: "checking", th: { title: "กำลังตรวจเช็ก", detail: "ช่างกำลังประเมินความเสียหายและอะไหล่" }, en: { title: "Inspection", detail: "A technician is assessing the damage and required parts" } },
  { id: "repairing", th: { title: "กำลังซ่อม", detail: "อุปกรณ์อยู่ระหว่างดำเนินการซ่อม" }, en: { title: "Repair in progress", detail: "Your device is currently being repaired" } },
  { id: "completed", th: { title: "เสร็จสิ้น", detail: "งานซ่อมเสร็จแล้วและพร้อมรับเครื่อง" }, en: { title: "Completed", detail: "The repair is complete and the device is ready for collection" } },
] as const;

const copy = {
  th: { status: "สถานะงานซ่อม", owner: "เจ้าของงานซ่อม", waitingPrice: "รอประเมินราคา", current: "สถานะปัจจุบัน", askLine: "สอบถามงานซ่อมผ่าน LINE", linkLine: "รับแจ้งเตือนอัตโนมัติ: เพิ่มเพื่อนแล้วส่ง LINK รหัสงาน และเลขท้ายเบอร์โทร 4 หลัก", loadError: "ไม่สามารถโหลดข้อมูลงานซ่อมได้", loading: "กำลังโหลดสถานะงานซ่อม...", payment: "ชำระค่าซ่อม", pending: "กำลังตรวจสอบการชำระเงิน", paid: "ชำระเงินแล้ว", evidence: "หลักฐานการซ่อม", parts: "อะไหล่ที่เปลี่ยน", quote: "อนุมัติราคาซ่อม", approve: "อนุมัติราคา", reject: "ปฏิเสธราคา", phoneSuffix: "เลขท้ายเบอร์โทร 4 หลัก", warranty: "ใบรับประกันดิจิทัล", review: "รีวิวบริการ", sendReview: "ส่งรีวิว", submitted: "ส่งข้อมูลเรียบร้อยแล้ว" },
  en: { status: "Repair status", owner: "Repair owner", waitingPrice: "Waiting for estimate", current: "Current status", askLine: "Ask about this repair on LINE", linkLine: "For automatic updates, add the account and send LINK, your repair ID, and the last 4 phone digits", loadError: "Unable to load this repair job", loading: "Loading repair status...", payment: "Pay repair fee", pending: "Payment is being reviewed", paid: "Payment received", evidence: "Repair evidence", parts: "Replaced parts", quote: "Approve repair quote", approve: "Approve quote", reject: "Reject quote", phoneSuffix: "Last 4 phone digits", warranty: "Digital warranty", review: "Review our service", sendReview: "Submit review", submitted: "Submitted successfully" },
} as const;

export default function RepairStatusClient({ repairId }: { repairId: string }) {
  const { language, toggleLanguage } = useLanguage();
  const text = copy[language];
  const [job, setJob] = useState<Job | null>(null);
  const [failed, setFailed] = useState(false);
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
  const activeJob = job;

  const current = Math.max(0, stages.findIndex((stage) => stage.id === job.status));
  const estimated = job.estimatedMin ? `${job.estimatedMin.toLocaleString(language === "th" ? "th-TH" : "en-US")}${job.estimatedMax && job.estimatedMax !== job.estimatedMin ? ` – ${job.estimatedMax.toLocaleString(language === "th" ? "th-TH" : "en-US")}` : ""} ${language === "th" ? "บาท" : "THB"}` : text.waitingPrice;
  const price = job.finalPrice ? `${job.finalPrice.toLocaleString(language === "th" ? "th-TH" : "en-US")} ${language === "th" ? "บาท" : "THB"}` : estimated;
  async function respondQuote(decision: "approved" | "rejected") { setSubmitting(true); setActionError(""); const response = await fetch(`/api/repairs/${encodeURIComponent(activeJob.id)}/quote`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, phoneSuffix }) }); const data = await response.json() as { repair?: Job; error?: string }; if (response.ok && data.repair) setJob(data.repair); else setActionError(data.error ?? text.loadError); setSubmitting(false); }
  async function submitReview() { setSubmitting(true); setActionError(""); const response = await fetch(`/api/repairs/${encodeURIComponent(activeJob.id)}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, comment, phoneSuffix }) }); const data = await response.json() as { review?: NonNullable<Job["review"]>; error?: string }; if (response.ok && data.review) setJob({ ...activeJob, review: data.review }); else setActionError(data.error ?? text.loadError); setSubmitting(false); }

  return <main className="flow-page status-page">
    <header className="flow-header"><a href="/">←</a><strong>{text.status} #{job.id}</strong>{languageButton}</header>
    <section className="status-device"><span>{job.deviceType.includes("โทรศัพท์") ? "📱" : "💻"}</span><div><h1>{job.deviceModel}</h1><p>{text.owner}: {job.customerName}</p></div><strong>{price}</strong></section>
    <section className="status-timeline">{stages.map((stage, index) => { const stageText = stage[language]; const history = job.history.find((item) => item.status === stage.id); const done = index < current; const active = index === current; return <article className={done ? "done" : active ? "current" : ""} key={stage.id}><i>{done ? "✓" : active ? "●" : ""}</i><div><header><h2>{stageText.title}</h2>{history && <time>{new Date(history.createdAt * 1000).toLocaleString(language === "th" ? "th-TH" : "en-US", { dateStyle: "medium", timeStyle: "short" })}</time>}</header><p>{language === "th" && history?.note ? history.note : stageText.detail}</p>{active && <small>{text.current}</small>}</div></article>; })}</section>
    {(job.media.length>0||job.parts.length>0)&&<section className="repair-evidence-card">{job.media.length>0&&<><h2>{text.evidence}</h2><div className="customer-media-grid">{job.media.map(media=><figure key={media.id}><img src={`/api/repairs/${encodeURIComponent(job.id)}/media/${media.id}`} alt={media.caption??(media.kind==="before"?"Before repair":media.kind==="after"?"After repair":"Replacement part")}/><figcaption>{media.caption??(media.kind==="before"?(language==="th"?"ก่อนซ่อม":"Before"):media.kind==="after"?(language==="th"?"หลังซ่อม":"After"):(language==="th"?"อะไหล่":"Part"))}</figcaption></figure>)}</div></>}{job.parts.length>0&&<><h2>{text.parts}</h2><div className="customer-parts-list">{job.parts.map(part=><div key={part.id}><strong>{part.name}</strong><span>{part.quantity} × {part.unitPrice.toLocaleString()} {language==="th"?"บาท":"THB"}</span><small>{language==="th"?`รับประกัน ${part.warrantyDays} วัน`:`${part.warrantyDays}-day warranty`}</small></div>)}</div></>}</section>}
    {job.quote&&<section className={`customer-quote-card ${job.quote.status}`}><small>{text.quote}</small><h2>{job.quote.totalAmount.toLocaleString()} {language==="th"?"บาท":"THB"}</h2><div><span>{language==="th"?"ค่าอะไหล่":"Parts"} <b>{job.quote.partsAmount.toLocaleString()}</b></span><span>{language==="th"?"ค่าแรง":"Labor"} <b>{job.quote.laborAmount.toLocaleString()}</b></span></div>{job.quote.note&&<p>{job.quote.note}</p>}{job.quote.status==="pending"?<><input inputMode="numeric" maxLength={4} value={phoneSuffix} onChange={e=>setPhoneSuffix(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder={text.phoneSuffix}/><div className="quote-actions"><button disabled={submitting||phoneSuffix.length!==4} onClick={()=>respondQuote("rejected")}>{text.reject}</button><button disabled={submitting||phoneSuffix.length!==4} onClick={()=>respondQuote("approved")}>{text.approve}</button></div></>:<strong className="quote-result">{job.quote.status==="approved"?`✓ ${language==="th"?"อนุมัติราคาแล้ว":"Quote approved"}`:language==="th"?"ปฏิเสธราคาแล้ว":"Quote rejected"}</strong>}</section>}
    {job.warranty&&<section className="digital-warranty"><header><div><small>{text.warranty}</small><h2>{job.warranty.warrantyNumber}</h2></div><button type="button" onClick={()=>window.print()}>{language==="th"?"พิมพ์ / บันทึก PDF":"Print / Save PDF"}</button></header><div><span>{language==="th"?"เริ่มรับประกัน":"Starts"}<b>{new Date(job.warranty.startsAt*1000).toLocaleDateString(language==="th"?"th-TH":"en-US")}</b></span><span>{language==="th"?"สิ้นสุด":"Ends"}<b>{new Date(job.warranty.endsAt*1000).toLocaleDateString(language==="th"?"th-TH":"en-US")}</b></span></div><p>{job.warranty.terms}</p></section>}
    {job.status==="completed"&&<section className="customer-review-card"><h2>{text.review}</h2>{job.review?<p className="review-thanks">✓ {text.submitted} · {"★".repeat(job.review.rating)}</p>:<><div className="star-picker" aria-label={text.review}>{[1,2,3,4,5].map(value=><button type="button" aria-label={`${value} stars`} onClick={()=>setRating(value)} className={value<=rating?"selected":""} key={value}>★</button>)}</div><textarea maxLength={1000} value={comment} onChange={e=>setComment(e.target.value)} placeholder={language==="th"?"บอกเล่าประสบการณ์ของคุณ (ไม่บังคับ)":"Tell us about your experience (optional)"}/><input inputMode="numeric" maxLength={4} value={phoneSuffix} onChange={e=>setPhoneSuffix(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder={text.phoneSuffix}/><button className="primary-action" disabled={submitting||phoneSuffix.length!==4} onClick={submitReview}>{text.sendReview}</button></>}</section>}
    {actionError&&<p className="status-action-error" role="alert">{actionError}</p>}
    <div className="status-actions">{job.finalPrice && job.paymentStatus === "unpaid" && <a className="primary-action" href={`/payment?repairId=${encodeURIComponent(job.id)}`}>{text.payment}</a>}{job.paymentStatus === "pending" && <span>{text.pending}</span>}{job.paymentStatus === "paid" && <span className="paid">✓ {text.paid}</span>}<a className="line-help" href="/api/line/chat" target="_blank" rel="noreferrer">{text.askLine}</a><small>{text.linkLine}<br /><b>LINK {job.id} 1234</b></small></div>
  </main>;
}
