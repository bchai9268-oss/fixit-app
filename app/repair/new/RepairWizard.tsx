"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is unstable for these routes. */

import { FormEvent, useState } from "react";
import { commonText } from "../../i18n";
import { useLanguage } from "../../useLanguage";

const devices = {
  phone: { th: "โทรศัพท์มือถือ", en: "Mobile phone" },
  laptop: { th: "โน้ตบุ๊ก", en: "Laptop" },
  desktop: { th: "คอมพิวเตอร์ประกอบ", en: "Desktop computer" },
  other: { th: "อุปกรณ์อื่นๆ", en: "Other device" },
} as const;

type DeviceKey = keyof typeof devices;

const symptoms = {
  phone: [
    { id: "screen", th: "หน้าจอแตก / ทัชสกรีนไม่ได้", en: "Cracked screen / touch not working" },
    { id: "battery", th: "แบตเสื่อม / แบตเตอรี่บวม", en: "Weak or swollen battery" },
    { id: "charging", th: "ชาร์จไฟไม่เข้า / พอร์ตชาร์จหลวม", en: "Not charging / loose charging port" },
    { id: "audio", th: "ลำโพงไม่ดัง / ไมค์ไม่ได้ยิน", en: "Speaker or microphone problem" },
    { id: "camera", th: "กล้องหรือ Face ID มีปัญหา", en: "Camera or Face ID problem" },
    { id: "other", th: "อาการอื่นๆ", en: "Other problem" },
  ],
  laptop: [
    { id: "power", th: "เปิดเครื่องไม่ติด", en: "Will not power on" },
    { id: "display", th: "หน้าจอไม่แสดงผล", en: "Display not working" },
    { id: "keyboard", th: "คีย์บอร์ดหรือทัชแพดเสีย", en: "Keyboard or touchpad problem" },
    { id: "heat", th: "เครื่องร้อนหรือดับเอง", en: "Overheating or shutting down" },
    { id: "charging", th: "ชาร์จไฟไม่เข้า", en: "Not charging" },
    { id: "other", th: "อาการอื่นๆ", en: "Other problem" },
  ],
  desktop: [
    { id: "power", th: "เปิดเครื่องไม่ติด", en: "Will not power on" },
    { id: "crash", th: "จอฟ้าหรือค้าง", en: "Blue screen or freezing" },
    { id: "slow", th: "เครื่องช้าผิดปกติ", en: "Unusually slow" },
    { id: "heat", th: "มีเสียงดังหรือความร้อนสูง", en: "Excessive noise or heat" },
    { id: "upgrade", th: "ต้องการอัปเกรดอุปกรณ์", en: "Hardware upgrade" },
    { id: "other", th: "อาการอื่นๆ", en: "Other problem" },
  ],
  other: [
    { id: "power", th: "เปิดไม่ติด", en: "Will not power on" },
    { id: "touch", th: "หน้าจอหรือระบบสัมผัสเสีย", en: "Screen or touch problem" },
    { id: "battery", th: "แบตเตอรี่เสื่อม", en: "Weak battery" },
    { id: "connection", th: "เชื่อมต่อไม่ได้", en: "Connection problem" },
    { id: "other", th: "อาการอื่นๆ", en: "Other problem" },
  ],
} as const;

const copy = {
  th: {
    backLabel: "กลับหน้าหลัก", title: "ประเมินอาการเสีย", stepsLabel: "ขั้นตอนแจ้งซ่อม", steps: ["เลือกอาการ", "ข้อมูลติดต่อ", "สรุป"],
    step: (value: number) => `ขั้นตอนที่ ${value} จาก 3`, symptomTitle: "เครื่องของคุณมีอาการอย่างไรบ้าง?", symptomHelp: "เลือกประเมินเบื้องต้นได้มากกว่า 1 ข้อ", deviceLabel: "ประเภทอุปกรณ์", next: "ถัดไป",
    contactTitle: "ข้อมูลอุปกรณ์และผู้ติดต่อ", model: "ยี่ห้อ / รุ่นอุปกรณ์", modelExample: "เช่น iPhone 13 Pro", name: "ชื่อผู้ติดต่อ", phone: "เบอร์โทรศัพท์", email: "อีเมล (ถ้ามี)", note: "รายละเอียดเพิ่มเติม", noteHelp: "ข้อมูลที่ช่วยให้ช่างตรวจสอบได้เร็วขึ้น", back: "ย้อนกลับ", review: "ตรวจสอบข้อมูล",
    summaryTitle: "ตรวจสอบข้อมูลแจ้งซ่อม", device: "อุปกรณ์", symptom: "อาการ", contact: "ผู้ติดต่อ", edit: "แก้ไขข้อมูล", saving: "กำลังบันทึก...", confirm: "ยืนยันแจ้งซ่อม", saveError: "บันทึกไม่สำเร็จ",
    otherLabel: "โปรดอธิบายอาการอื่น ๆ", otherPlaceholder: "เช่น เครื่องตกน้ำ เปิดใช้งานบางครั้งไม่ได้ หรือมีอาการผิดปกติอื่น ๆ", complete: "รับเรื่องเรียบร้อยแล้ว", keepCode: "บันทึกรหัสนี้ไว้สำหรับตรวจสอบสถานะงานซ่อม", viewStatus: "ดูสถานะงานซ่อม",
  },
  en: {
    backLabel: "Back to home", title: "Repair assessment", stepsLabel: "Repair request steps", steps: ["Symptoms", "Contact details", "Review"],
    step: (value: number) => `Step ${value} of 3`, symptomTitle: "What is wrong with your device?", symptomHelp: "Select one or more initial symptoms", deviceLabel: "Device type", next: "Next",
    contactTitle: "Device and contact details", model: "Brand / device model", modelExample: "For example, iPhone 13 Pro", name: "Contact name", phone: "Phone number", email: "Email (optional)", note: "Additional details", noteHelp: "Information that may help our technician inspect it faster", back: "Back", review: "Review details",
    summaryTitle: "Review your repair request", device: "Device", symptom: "Symptoms", contact: "Contact", edit: "Edit details", saving: "Saving...", confirm: "Submit repair request", saveError: "Unable to save your repair request",
    otherLabel: "Describe the other problem", otherPlaceholder: "For example, water damage or an intermittent problem", complete: "Repair request received", keepCode: "Keep this repair ID to check the latest status", viewStatus: "View repair status",
  },
} as const;

export default function RepairWizard({ initialDevice }: { initialDevice: string }) {
  const { language, toggleLanguage } = useLanguage();
  const text = copy[language];
  const safeInitial: DeviceKey = initialDevice in devices ? initialDevice as DeviceKey : "phone";
  const [step, setStep] = useState(1);
  const [deviceType, setDeviceType] = useState<DeviceKey>(safeInitial);
  const [selected, setSelected] = useState<string[]>([]);
  const [otherSymptom, setOtherSymptom] = useState("");
  const [model, setModel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [repairId, setRepairId] = useState("");

  function toggle(value: string) { setSelected((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]); }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const selectedSymptoms: string[] = symptoms[deviceType].filter((item) => selected.includes(item.id) && item.id !== "other").map((item) => item.th);
      if (selected.includes("other") && otherSymptom.trim()) selectedSymptoms.push(`อาการอื่น ๆ: ${otherSymptom.trim()}`);
      const response = await fetch("/api/repairs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, email, deviceType: devices[deviceType].th, deviceModel: model, symptoms: selectedSymptoms, note }) });
      const data = await response.json() as { repair?: { id: string }; error?: string };
      if (!response.ok || !data.repair) throw new Error(language === "en" ? text.saveError : (data.error || text.saveError));
      setRepairId(data.repair.id);
    } catch (reason) { setError(reason instanceof Error ? reason.message : text.saveError); }
    finally { setSaving(false); }
  }

  const languageButton = <button className="flow-language-toggle" type="button" onClick={toggleLanguage} aria-label={commonText[language].languageLabel}>{commonText[language].languageButton}</button>;
  const summarySymptoms: string[] = symptoms[deviceType].filter((item) => selected.includes(item.id) && item.id !== "other").map((item) => item[language]);
  if (selected.includes("other")) summarySymptoms.push(`${language === "th" ? "อาการอื่น ๆ" : "Other"}: ${otherSymptom}`);

  if (repairId) return <main className="flow-page"><header className="flow-header"><a href="/" aria-label={text.backLabel}>←</a><strong>FixIt Online</strong>{languageButton}</header><section className="repair-complete"><span>✓</span><p>{text.complete}</p><h1>{repairId}</h1><small>{text.keepCode}</small><a className="primary-action" href={`/repair/status/${encodeURIComponent(repairId)}`}>{text.viewStatus}</a><a href="/">{commonText[language].backHome}</a></section></main>;

  return (
    <main className="flow-page">
      <header className="flow-header"><a href="/" aria-label={text.backLabel}>←</a><strong>{text.title} ({devices[deviceType][language]})</strong>{languageButton}</header>
      <nav className="stepper" aria-label={text.stepsLabel}>{text.steps.map((label, index) => <div className={step >= index + 1 ? "active" : ""} key={label}><span>{index + 1}</span><small>{label}</small></div>)}</nav>
      <form className="wizard-card" onSubmit={submit}>
        {step === 1 && <section><p className="wizard-overline">{text.step(1)}</p><h1>{text.symptomTitle}</h1><p className="wizard-help">{text.symptomHelp}</p><select value={deviceType} onChange={(event) => { setDeviceType(event.target.value as DeviceKey); setSelected([]); setOtherSymptom(""); }} aria-label={text.deviceLabel}>{Object.entries(devices).map(([value, labels]) => <option value={value} key={value}>{labels[language]}</option>)}</select><div className="symptom-list">{symptoms[deviceType].map((symptom) => <button className={selected.includes(symptom.id) ? "selected" : ""} type="button" onClick={() => toggle(symptom.id)} key={symptom.id}><i>{selected.includes(symptom.id) ? "✓" : ""}</i><span>{symptom[language]}</span></button>)}</div>{selected.includes("other")&&<label className="other-symptom-field">{text.otherLabel}<textarea required maxLength={500} value={otherSymptom} onChange={(event)=>setOtherSymptom(event.target.value)} placeholder={text.otherPlaceholder} /></label>}<button className="primary-action" type="button" disabled={!selected.length || (selected.includes("other") && !otherSymptom.trim())} onClick={() => setStep(2)}>{text.next}</button></section>}
        {step === 2 && <section><p className="wizard-overline">{text.step(2)}</p><h1>{text.contactTitle}</h1><div className="wizard-fields"><label>{text.model}<input required value={model} onChange={(event) => setModel(event.target.value)} placeholder={text.modelExample} /></label><label>{text.name}<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>{text.phone}<input required inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="08x-xxx-xxxx" /></label><label>{text.email}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="wide">{text.note}<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={text.noteHelp} /></label></div><div className="wizard-actions"><button type="button" onClick={() => setStep(1)}>{text.back}</button><button className="primary-action" type="button" disabled={!model || !name || phone.replace(/\D/g, "").length < 9} onClick={() => setStep(3)}>{text.review}</button></div></section>}
        {step === 3 && <section><p className="wizard-overline">{text.step(3)}</p><h1>{text.summaryTitle}</h1><div className="repair-summary"><div><small>{text.device}</small><strong>{devices[deviceType][language]} · {model}</strong></div><div><small>{text.symptom}</small><strong>{summarySymptoms.join(", ")}</strong></div><div><small>{text.contact}</small><strong>{name} · {phone}</strong></div></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="wizard-actions"><button type="button" onClick={() => setStep(2)}>{text.edit}</button><button className="primary-action" type="submit" disabled={saving}>{saving ? text.saving : text.confirm}</button></div></section>}
      </form>
    </main>
  );
}
