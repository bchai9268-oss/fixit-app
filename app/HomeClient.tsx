"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is unstable for these routes. */

import { FormEvent, useState } from "react";

const categories = [
  { id: "phone", icon: "📱", title: "โทรศัพท์มือถือ", detail: "หน้าจอ แบตเตอรี่ กล้อง" },
  { id: "laptop", icon: "💻", title: "โน้ตบุ๊ก", detail: "คีย์บอร์ด บอร์ด จอ" },
  { id: "desktop", icon: "🖥️", title: "คอมพิวเตอร์ประกอบ", detail: "อัปเกรด จัดสเปก ซ่อมบอร์ด" },
  { id: "other", icon: "⌚", title: "อุปกรณ์อื่นๆ", detail: "แท็บเล็ต Apple Watch หูฟัง" },
];

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);

  async function search(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setMessage("");
    try {
      const response = await fetch(`/api/repairs/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json() as { repair?: { id: string }; error?: string };
      if (!response.ok || !data.repair) throw new Error(data.error || "ไม่พบงานซ่อม");
      window.location.href = `/repair/status/${encodeURIComponent(data.repair.id)}`;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ไม่พบงานซ่อม");
      setSearching(false);
    }
  }

  return (
    <main className="customer-home">
      <header className="customer-header">
        <a className="online-brand" href="/" aria-label="FixIt Online หน้าหลัก"><span className="online-logo" aria-hidden="true">🔧</span><strong>FixIt Online</strong></a>
        <div className="customer-header-actions"><span>TH</span><a href="/admin" aria-label="เข้าสู่ระบบแอดมิน">◎</a></div>
      </header>
      <section className="customer-hero">
        <p className="customer-kicker">บริการแจ้งซ่อมออนไลน์</p>
        <h1>FixIt Online</h1>
        <h2>ซ่อมไว รู้ราคาประเมินทันที <em>ด้วยช่างมืออาชีพ</em></h2>
        <form className="repair-search-card" onSubmit={search}>
          <label htmlFor="repair-search">⌕ เช็กสถานะงานซ่อมของคุณ</label>
          <div><input id="repair-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="กรอกเบอร์โทร หรือ รหัสใบส่งซ่อม" /><button disabled={searching}>{searching ? "กำลังค้นหา" : "ค้นหา"}</button></div>
          {message && <p role="alert">{message}</p>}
        </form>
        <section className="device-section" aria-labelledby="device-title">
          <div className="section-heading"><div><span>เลือกอุปกรณ์</span><h2 id="device-title">เลือกประเภทอุปกรณ์ที่ต้องการซ่อม</h2></div><a href="/repair/new">แจ้งซ่อมทันที →</a></div>
          <div className="device-grid">
            {categories.map((category) => <a className="device-card" href={`/repair/new?device=${category.id}`} key={category.id}><span>{category.icon}</span><h3>{category.title}</h3><p>{category.detail}</p><b>เริ่มประเมินอาการ →</b></a>)}
          </div>
        </section>
      </section>
      <section className="home-benefits">
        <article><span>01</span><strong>ประเมินอาการง่าย</strong><p>เลือกอาการเบื้องต้นได้ภายในไม่กี่ขั้นตอน</p></article>
        <article><span>02</span><strong>ติดตามได้ตลอด</strong><p>รู้ความคืบหน้าของเครื่องโดยใช้รหัสงานซ่อม</p></article>
        <article><span>03</span><strong>ข้อมูลโปร่งใส</strong><p>แสดงสถานะและช่วงราคาประเมินอย่างชัดเจน</p></article>
      </section>
      <a className="line-float" href="https://line.me" target="_blank" rel="noreferrer" aria-label="แชตกับร้านทางไลน์"><span className="line-icon">LINE</span><span>แชตกับเรา</span></a>
    </main>
  );
}
