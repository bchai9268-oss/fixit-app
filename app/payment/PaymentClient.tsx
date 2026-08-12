"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is unstable for these routes. */

import { FormEvent, useState } from "react";
import type { PaymentConfig } from "../payment-config";
import type { RepairJob } from "../repairs";
import { commonText } from "../i18n";
import { useLanguage } from "../useLanguage";

const copy = {
  th: {
    home: "หน้าหลัก", status: "เช็กสถานะ", payment: "ชำระเงิน", admin: "เข้าสู่ระบบ", online: "ชำระเงินออนไลน์", title: "ชำระค่าบริการอย่างปลอดภัย", intro: "ตรวจสอบยอดงานซ่อมและแนบหลักฐานการชำระเงิน", findTitle: "กรอกรหัสงานซ่อมเพื่อชำระเงิน", repairId: "รหัสงานซ่อม", open: "เปิดรายการชำระเงิน", notFound: "ไม่พบงานซ่อมตามรหัสที่ระบุ", job: "หมายเลขงานซ่อม", ready: "พร้อมชำระเงิน", device: "อุปกรณ์", symptoms: "อาการ", total: "ยอดชำระทั้งหมด", noPrice: "ร้านยังไม่ได้กำหนดราคาสุทธิ กรุณาติดต่อร้านก่อนชำระเงิน", paid: "งานนี้ชำระเงินแล้ว", pending: "ส่งหลักฐานแล้วและกำลังรอตรวจสอบ", unavailable: "ร้านยังไม่ได้ตั้งค่าช่องทางรับชำระเงิน", method: "เลือกช่องทางชำระเงิน", promptpay: "พร้อมเพย์", bank: "โอนธนาคาร", account: "เลขบัญชี", payee: "ชื่อบัญชี", suffix: "เลขท้ายเบอร์โทร 4 หลัก", suffixHelp: "ใช้ยืนยันว่าเป็นเจ้าของงานซ่อม", slip: "แนบหลักฐานการชำระเงิน", fileHelp: "รองรับ JPG, PNG ขนาดไม่เกิน 5MB", submit: "ส่งหลักฐานการชำระเงิน", sending: "กำลังส่ง...", success: "ส่งหลักฐานแล้ว", successHelp: "ร้านจะตรวจสอบและอัปเดตสถานะการชำระเงิน", error: "ไม่สามารถส่งหลักฐานได้ กรุณาตรวจสอบข้อมูลและลองใหม่", line: "แชตกับเรา",
  },
  en: {
    home: "Home", status: "Repair status", payment: "Payment", admin: "Sign in", online: "Online payment", title: "Pay your repair fee securely", intro: "Review the repair total and upload your payment slip", findTitle: "Enter a repair ID to make a payment", repairId: "Repair ID", open: "Open payment", notFound: "No repair job was found for that ID", job: "Repair job", ready: "Ready for payment", device: "Device", symptoms: "Symptoms", total: "Total payment", noPrice: "The final price has not been set. Please contact the shop before paying.", paid: "This repair has been paid", pending: "Your payment slip is awaiting review", unavailable: "The shop has not configured a payment destination yet", method: "Choose a payment method", promptpay: "PromptPay", bank: "Bank transfer", account: "Account number", payee: "Account name", suffix: "Last 4 digits of your phone", suffixHelp: "Used to verify the repair owner", slip: "Upload payment slip", fileHelp: "JPG or PNG, up to 5 MB", submit: "Submit payment slip", sending: "Submitting...", success: "Payment slip submitted", successHelp: "The shop will review it and update your payment status", error: "Unable to submit the slip. Check the information and try again.", line: "Chat with us",
  },
} as const;

export type PaymentRepair = Pick<RepairJob, "id" | "deviceType" | "deviceModel" | "symptoms" | "finalPrice" | "paymentStatus">;
type Props = { repair: PaymentRepair | null; requestedRepairId: string; config: PaymentConfig };

export default function PaymentClient({ repair, requestedRepairId, config }: Props) {
  const { language, toggleLanguage } = useLanguage();
  const text = copy[language];
  const [lookup, setLookup] = useState(requestedRepairId);
  const [method, setMethod] = useState<"qr" | "bank">(config.promptPayId ? "qr" : "bank");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [slip, setSlip] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  function openRepair(event: FormEvent) { event.preventDefault(); if (lookup.trim()) window.location.href = `/payment?repairId=${encodeURIComponent(lookup.trim())}`; }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!repair || !slip) return; setState("sending");
    const form = new FormData(); form.set("repairId", repair.id); form.set("phoneSuffix", phoneSuffix); form.set("method", method); form.set("slip", slip);
    const response = await fetch("/api/payments", { method: "POST", body: form });
    setState(response.ok ? "sent" : "failed");
  }

  const amount = repair?.finalPrice?.toLocaleString(language === "th" ? "th-TH" : "en-US");
  const canSubmit = Boolean(repair?.finalPrice && repair.paymentStatus === "unpaid" && config.configured);

  return <main className="app-shell">
    <header className="site-header"><a href="/" className="brand"><span className="brand-mark">F</span><span>FixIT <b>Care</b></span></a><nav className="main-nav"><a href="/">{text.home}</a><a href="/">{text.status}</a><a className="active" href="/payment">{text.payment}</a></nav><div className="payment-header-actions"><button className="language-toggle" type="button" onClick={toggleLanguage}>{commonText[language].languageButton}</button><a href="/admin" className="button button-small button-outline">{text.admin}</a></div></header>
    <section className="payment-wrap"><div className="page-intro"><a href="/" className="back-link">← {commonText[language].backHome}</a><span className="section-label">{text.online}</span><h1>{text.title}</h1><p>{text.intro}</p></div>
      {!repair ? <section className="checkout-card payment-lookup"><h2>{text.findTitle}</h2><form onSubmit={openRepair}><label>{text.repairId}<input value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="REP-260812-AB12" /></label><button className="button button-primary full">{text.open}</button></form>{requestedRepairId && <p className="form-error">{text.notFound}</p>}</section> : <div className="payment-grid">
        <section className="invoice-card"><div className="invoice-head"><div><small>{text.job}</small><h2>{repair.id}</h2></div><span className="ready-pill">{text.ready}</span></div><div className="device-summary"><span className="device-icon">{repair.deviceType.includes("โทรศัพท์") ? "📱" : "💻"}</span><div><strong>{repair.deviceModel}</strong><p>{repair.symptoms.join(", ")}</p></div></div><div className="bill-lines"><div><span>{text.device}</span><strong>{repair.deviceModel}</strong></div><div><span>{text.symptoms}</span><strong>{repair.symptoms.length}</strong></div><div className="total"><span>{text.total}</span><strong>{amount ? `${amount} ${language === "th" ? "บาท" : "THB"}` : "—"}</strong></div></div></section>
        <section className="checkout-card">{state === "sent" ? <div className="success-box payment-success"><div className="success-icon">✓</div><h2>{text.success}</h2><p>{text.successHelp}</p><a className="button button-primary full" href={`/repair/status/${encodeURIComponent(repair.id)}`}>{text.status}</a></div> : repair.paymentStatus === "paid" ? <div className="payment-state paid">✓ {text.paid}</div> : repair.paymentStatus === "pending" ? <div className="payment-state pending">{text.pending}</div> : !repair.finalPrice ? <div className="payment-state">{text.noPrice}</div> : !config.configured ? <div className="payment-state">{text.unavailable}</div> : <form onSubmit={submit}><h2>{text.method}</h2><div className="method-tabs">{config.promptPayId && <button type="button" className={method === "qr" ? "selected" : ""} onClick={() => setMethod("qr")}>▦ {text.promptpay}</button>}{config.accountNumber && <button type="button" className={method === "bank" ? "selected" : ""} onClick={() => setMethod("bank")}>▤ {text.bank}</button>}</div>{method === "qr" ? <div className="bank-area"><div className="bank-logo">P</div><div><small>{text.promptpay}</small><strong>{config.promptPayId}</strong><p>{config.accountName}</p></div></div> : <div className="bank-area"><div className="bank-logo">฿</div><div><small>{config.bankName}</small><strong>{config.accountNumber}</strong><p>{config.accountName}</p></div></div>}<label>{text.suffix}<input required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={phoneSuffix} onChange={(event) => setPhoneSuffix(event.target.value.replace(/\D/g, "").slice(0, 4))} /><small>{text.suffixHelp}</small></label><label className="upload-box"><input required type="file" accept="image/jpeg,image/png" onChange={(event) => setSlip(event.target.files?.[0] ?? null)} /><span>＋</span><strong>{text.slip}</strong><small>{slip?.name || text.fileHelp}</small></label>{state === "failed" && <p className="form-error">{text.error}</p>}<button className="button button-primary full" disabled={!canSubmit || !slip || phoneSuffix.length !== 4 || state === "sending"}>{state === "sending" ? text.sending : text.submit}</button></form>}</section>
      </div>}
    </section><a className="line-float" href="/api/line/chat" target="_blank" rel="noreferrer"><span className="line-icon">LINE</span><span>{text.line}</span></a>
  </main>;
}
