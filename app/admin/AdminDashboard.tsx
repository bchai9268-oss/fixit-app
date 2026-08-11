"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is unstable for these routes. */

import { useMemo, useState } from "react";

type Job = { id: string; customerName: string; phone: string; deviceType: string; deviceModel: string; symptoms: string[]; status: "received" | "checking" | "repairing" | "completed"; priority: "urgent" | "normal" | "low"; estimatedMin: number | null; estimatedMax: number | null; updatedAt: number; history: Array<{ status: string; note: string | null; createdAt: number }> };
type Props = { admin: { displayName: string; email: string }; initialJobs: Job[] };

const demoJobs: Job[] = [
  { id: "REP-1234", customerName: "คุณสมชาย ใจดี", phone: "0812345678", deviceType: "โทรศัพท์มือถือ", deviceModel: "iPhone 13 Pro", symptoms: ["หน้าจอแตก / ทัชสกรีนไม่ได้"], status: "received", priority: "urgent", estimatedMin: 1000, estimatedMax: 1500, updatedAt: 1786417200, history: [] },
  { id: "REP-1235", customerName: "คุณอารยา รักดี", phone: "0898765432", deviceType: "โน้ตบุ๊ก", deviceModel: "MacBook Air M1", symptoms: ["คีย์บอร์ดบางปุ่มกดไม่ติด"], status: "received", priority: "normal", estimatedMin: 2500, estimatedMax: 3500, updatedAt: 1786414500, history: [] },
  { id: "REP-1229", customerName: "คุณณัฐพล มีสุข", phone: "0861112233", deviceType: "แท็บเล็ต", deviceModel: "iPad Pro 11", symptoms: ["แบตเสื่อม / แบตเตอรี่บวม"], status: "checking", priority: "urgent", estimatedMin: 1800, estimatedMax: 1800, updatedAt: 1786334400, history: [] },
  { id: "REP-1231", customerName: "คุณเกศรา แสนดี", phone: "0823334455", deviceType: "อุปกรณ์อื่นๆ", deviceModel: "Apple Watch S7", symptoms: ["ชาร์จไฟไม่เข้า"], status: "checking", priority: "normal", estimatedMin: null, estimatedMax: null, updatedAt: 1786325400, history: [] },
  { id: "REP-1225", customerName: "คุณธนพล เจริญยิ่ง", phone: "0845556677", deviceType: "โน้ตบุ๊ก", deviceModel: "Asus ROG", symptoms: ["พัดลมเสียงดังมาก ร้อนจัดแล้วดับ"], status: "repairing", priority: "normal", estimatedMin: 1200, estimatedMax: 1200, updatedAt: 1786240800, history: [] },
  { id: "REP-1220", customerName: "คุณสมศักดิ์ รักษาดี", phone: "0877778899", deviceType: "โทรศัพท์มือถือ", deviceModel: "iPhone 13", symptoms: ["เปลี่ยนหน้าจอแท้ศูนย์"], status: "completed", priority: "normal", estimatedMin: 3500, estimatedMax: 3500, updatedAt: 1786150800, history: [] },
];

const columns = [
  { id: "received", icon: "📥", title: "รอรับเรื่อง" },
  { id: "checking", icon: "⌕", title: "กำลังตรวจ/รออะไหล่" },
  { id: "repairing", icon: "🔧", title: "กำลังซ่อม" },
  { id: "completed", icon: "✅", title: "เสร็จสิ้น" },
] as const;

function deviceIcon(type: string) { return type.includes("โทรศัพท์") || type.includes("แท็บเล็ต") ? "📱" : type.includes("โน้ตบุ๊ก") ? "💻" : "⌚"; }

export default function AdminDashboard({ admin, initialJobs }: Props) {
  const [jobs, setJobs] = useState(initialJobs.length ? initialJobs : demoJobs);
  const [query, setQuery] = useState(""); const [updating, setUpdating] = useState("");
  const visibleJobs = useMemo(() => jobs.filter((job) => `${job.id} ${job.customerName} ${job.phone} ${job.deviceModel}`.toLowerCase().includes(query.toLowerCase())), [jobs, query]);

  async function advance(job: Job) {
    const index = columns.findIndex((column) => column.id === job.status); if (index >= columns.length - 1) return;
    const status = columns[index + 1].id; setUpdating(job.id);
    if (initialJobs.length) {
      const response = await fetch(`/api/repairs/${encodeURIComponent(job.id)}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, note: `อัปเดตโดย ${admin.displayName}` }) });
      if (!response.ok) { setUpdating(""); return; }
    }
    setJobs((current) => current.map((item) => item.id === job.id ? { ...item, status, updatedAt: Math.floor(Date.now() / 1000) } : item)); setUpdating("");
  }

  return <main className="repair-dashboard">
    <aside className="repair-sidebar"><a className="online-brand" href="/"><span className="online-logo">🔧</span><strong>FixIt Online</strong></a><nav><button>📊 <span>Dashboard</span></button><button className="selected">📋 <span>จัดการงานซ่อม</span></button><button>❓ <span>จัดการคำถาม-ราคา</span></button><button>⚙️ <span>ตั้งค่าระบบ</span></button></nav><form action="/api/admin/logout" method="post"><button type="submit">↪ <span>ออกจากระบบ</span></button></form></aside>
    <section className="repair-workspace"><header className="admin-topbar"><label>⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหารหัสงานซ่อม ชื่อลูกค้า หรือเบอร์โทร" aria-label="ค้นหางานซ่อม" /></label><div><span>🔔</span><i>◎</i><p><strong>{admin.displayName}</strong><small>{admin.email}</small></p></div></header>
      <div className="board-heading"><div><p>ศูนย์ควบคุมงานซ่อม</p><h1>จัดการงานซ่อม <span>(Repair Queue)</span></h1><small>อัปเดตสถานะงานซ่อมเพื่อให้ลูกค้าติดตามความคืบหน้าได้ทันที</small></div><span className="line-online">▣ ระบบแจ้งเตือนพร้อมทำงาน</span></div>
      <section className="repair-board">{columns.map((column) => { const columnJobs = visibleJobs.filter((job) => job.status === column.id); return <section className={`board-column ${column.id}`} key={column.id}><header><h2>{column.icon} {column.title}</h2><span>{columnJobs.length}</span></header><div>{columnJobs.map((job) => <article className="repair-job-card" key={job.id}><header><a href={`/repair/status/${encodeURIComponent(job.id)}`}>#{job.id}</a><span className={job.priority}>{job.priority === "urgent" ? "ด่วนที่สุด" : job.priority === "low" ? "ทั่วไป" : "ปกติ"}</span></header><h3>{deviceIcon(job.deviceType)} {job.deviceModel}</h3><p>ลูกค้า: {job.customerName}</p><div className="job-symptom">🛠 {job.symptoms.join(", ")}</div><footer><time>{new Date(job.updatedAt * 1000).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}</time><strong>{job.estimatedMin ? `${job.estimatedMin.toLocaleString()}${job.estimatedMax && job.estimatedMax !== job.estimatedMin ? ` - ${job.estimatedMax.toLocaleString()}` : ""} บาท` : "กำลังเช็กราคา"}</strong></footer>{column.id !== "completed" && <button className="advance-job" disabled={updating === job.id} onClick={() => advance(job)}>{updating === job.id ? "กำลังอัปเดต..." : `ย้ายไป ${columns[columns.findIndex((item) => item.id === column.id) + 1].title} →`}</button>}{column.id === "completed" && <small className="notified">▣ พร้อมแจ้งเตือนลูกค้า</small>}</article>)}</div></section>; })}</section>
    </section>
  </main>;
}
