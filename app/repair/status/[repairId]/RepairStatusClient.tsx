"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is unstable for these routes. */

import { useEffect, useState } from "react";

type Job = { id: string; customerName: string; deviceType: string; deviceModel: string; symptoms: string[]; status: string; estimatedMin: number | null; estimatedMax: number | null; history: Array<{ status: string; note: string | null; createdAt: number }> };
const stages = [
  { id: "received", title: "รับเรื่องแล้ว", detail: "ร้านได้รับข้อมูลและเตรียมตรวจสอบอุปกรณ์" },
  { id: "checking", title: "กำลังตรวจเช็ก", detail: "ช่างกำลังประเมินความเสียหายและอะไหล่" },
  { id: "repairing", title: "กำลังซ่อม", detail: "อุปกรณ์อยู่ระหว่างดำเนินการซ่อม" },
  { id: "completed", title: "เสร็จสิ้น", detail: "งานซ่อมเสร็จแล้วและพร้อมรับเครื่อง" },
];

export default function RepairStatusClient({ repairId }: { repairId: string }) {
  const [job, setJob] = useState<Job | null>(null); const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/repairs/${encodeURIComponent(repairId)}`).then(async (response) => { const data = await response.json() as { repair?: Job; error?: string }; if (!response.ok || !data.repair) throw new Error(data.error || "ไม่พบงานซ่อม"); setJob(data.repair); }).catch((reason) => setError(reason instanceof Error ? reason.message : "โหลดข้อมูลไม่สำเร็จ")); }, [repairId]);
  if (error) return <main className="flow-page"><section className="repair-complete"><span>!</span><h1>{error}</h1><a href="/">กลับหน้าหลัก</a></section></main>;
  if (!job) return <main className="flow-page"><p className="loading-state">กำลังโหลดสถานะงานซ่อม...</p></main>;
  const current = Math.max(0, stages.findIndex((stage) => stage.id === job.status));
  const price = job.estimatedMin ? `${job.estimatedMin.toLocaleString()}${job.estimatedMax && job.estimatedMax !== job.estimatedMin ? ` – ${job.estimatedMax.toLocaleString()}` : ""} บาท` : "รอประเมินราคา";
  return <main className="flow-page status-page"><header className="flow-header"><a href="/">←</a><strong>สถานะงานซ่อม #{job.id}</strong></header><section className="status-device"><span>{job.deviceType.includes("โทรศัพท์") ? "📱" : "💻"}</span><div><h1>{job.deviceModel}</h1><p>เจ้าของงานซ่อม: {job.customerName}</p></div><strong>{price}</strong></section><section className="status-timeline">{stages.map((stage, index) => { const history = job.history.find((item) => item.status === stage.id); const done = index < current; const active = index === current; return <article className={done ? "done" : active ? "current" : ""} key={stage.id}><i>{done ? "✓" : active ? "●" : ""}</i><div><header><h2>{stage.title}</h2>{history && <time>{new Date(history.createdAt * 1000).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</time>}</header><p>{history?.note || stage.detail}</p>{active && <small>สถานะปัจจุบัน</small>}</div></article>; })}</section><a className="line-help" href="https://line.me" target="_blank" rel="noreferrer">สอบถามงานซ่อมผ่าน LINE</a></main>;
}
