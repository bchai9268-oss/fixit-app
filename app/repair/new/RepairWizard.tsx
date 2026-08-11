"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is unstable for these routes. */

import { FormEvent, useState } from "react";

const deviceNames: Record<string, string> = { phone: "โทรศัพท์มือถือ", laptop: "โน้ตบุ๊ก", desktop: "คอมพิวเตอร์ประกอบ", other: "อุปกรณ์อื่นๆ" };
const symptomsByDevice: Record<string, string[]> = {
  phone: ["หน้าจอแตก / ทัชสกรีนไม่ได้", "แบตเสื่อม / แบตเตอรี่บวม", "ชาร์จไฟไม่เข้า / พอร์ตชาร์จหลวม", "ลำโพงไม่ดัง / ไมค์ไม่ได้ยิน", "กล้องหรือ Face ID มีปัญหา"],
  laptop: ["เปิดเครื่องไม่ติด", "หน้าจอไม่แสดงผล", "คีย์บอร์ดหรือทัชแพดเสีย", "เครื่องร้อนหรือดับเอง", "ชาร์จไฟไม่เข้า"],
  desktop: ["เปิดเครื่องไม่ติด", "จอฟ้าหรือค้าง", "เครื่องช้าผิดปกติ", "มีเสียงดังหรือความร้อนสูง", "ต้องการอัปเกรดอุปกรณ์"],
  other: ["เปิดไม่ติด", "หน้าจอหรือระบบสัมผัสเสีย", "แบตเตอรี่เสื่อม", "เชื่อมต่อไม่ได้", "อาการอื่นๆ"],
};

export default function RepairWizard({ initialDevice }: { initialDevice: string }) {
  const safeInitial = deviceNames[initialDevice] ? initialDevice : "phone";
  const [step, setStep] = useState(1);
  const [deviceType, setDeviceType] = useState(safeInitial);
  const [selected, setSelected] = useState<string[]>([]);
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
      const response = await fetch("/api/repairs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, email, deviceType: deviceNames[deviceType], deviceModel: model, symptoms: selected, note }) });
      const data = await response.json() as { repair?: { id: string }; error?: string };
      if (!response.ok || !data.repair) throw new Error(data.error || "บันทึกไม่สำเร็จ");
      setRepairId(data.repair.id);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "บันทึกไม่สำเร็จ"); }
    finally { setSaving(false); }
  }

  if (repairId) return <main className="flow-page"><section className="repair-complete"><span>✓</span><p>รับเรื่องเรียบร้อยแล้ว</p><h1>{repairId}</h1><small>บันทึกรหัสนี้ไว้สำหรับตรวจสอบสถานะงานซ่อม</small><a className="primary-action" href={`/repair/status/${encodeURIComponent(repairId)}`}>ดูสถานะงานซ่อม</a><a href="/">กลับหน้าหลัก</a></section></main>;

  return (
    <main className="flow-page">
      <header className="flow-header"><a href="/" aria-label="กลับหน้าหลัก">←</a><strong>ประเมินอาการเสีย ({deviceNames[deviceType]})</strong></header>
      <nav className="stepper" aria-label="ขั้นตอนแจ้งซ่อม">{["เลือกอาการ", "ข้อมูลติดต่อ", "สรุป"].map((label, index) => <div className={step >= index + 1 ? "active" : ""} key={label}><span>{index + 1}</span><small>{label}</small></div>)}</nav>
      <form className="wizard-card" onSubmit={submit}>
        {step === 1 && <section><p className="wizard-overline">ขั้นตอนที่ 1 จาก 3</p><h1>เครื่องของคุณมีอาการอย่างไรบ้าง?</h1><p className="wizard-help">เลือกประเมินเบื้องต้นได้มากกว่า 1 ข้อ</p><select value={deviceType} onChange={(event) => { setDeviceType(event.target.value); setSelected([]); }} aria-label="ประเภทอุปกรณ์">{Object.entries(deviceNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><div className="symptom-list">{symptomsByDevice[deviceType].map((symptom) => <button className={selected.includes(symptom) ? "selected" : ""} type="button" onClick={() => toggle(symptom)} key={symptom}><i>{selected.includes(symptom) ? "✓" : ""}</i><span>{symptom}</span></button>)}</div><button className="primary-action" type="button" disabled={!selected.length} onClick={() => setStep(2)}>ถัดไป</button></section>}
        {step === 2 && <section><p className="wizard-overline">ขั้นตอนที่ 2 จาก 3</p><h1>ข้อมูลอุปกรณ์และผู้ติดต่อ</h1><div className="wizard-fields"><label>ยี่ห้อ / รุ่นอุปกรณ์<input required value={model} onChange={(event) => setModel(event.target.value)} placeholder="เช่น iPhone 13 Pro" /></label><label>ชื่อผู้ติดต่อ<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>เบอร์โทรศัพท์<input required inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="08x-xxx-xxxx" /></label><label>อีเมล (ถ้ามี)<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="wide">รายละเอียดเพิ่มเติม<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="ข้อมูลที่ช่วยให้ช่างตรวจสอบได้เร็วขึ้น" /></label></div><div className="wizard-actions"><button type="button" onClick={() => setStep(1)}>ย้อนกลับ</button><button className="primary-action" type="button" disabled={!model || !name || phone.replace(/\D/g, "").length < 9} onClick={() => setStep(3)}>ตรวจสอบข้อมูล</button></div></section>}
        {step === 3 && <section><p className="wizard-overline">ขั้นตอนที่ 3 จาก 3</p><h1>ตรวจสอบข้อมูลแจ้งซ่อม</h1><div className="repair-summary"><div><small>อุปกรณ์</small><strong>{deviceNames[deviceType]} · {model}</strong></div><div><small>อาการ</small><strong>{selected.join(", ")}</strong></div><div><small>ผู้ติดต่อ</small><strong>{name} · {phone}</strong></div></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="wizard-actions"><button type="button" onClick={() => setStep(2)}>แก้ไขข้อมูล</button><button className="primary-action" type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : "ยืนยันแจ้งซ่อม"}</button></div></section>}
      </form>
    </main>
  );
}
