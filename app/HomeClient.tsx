"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a vinext client-navigation runtime bug. */

import { FormEvent, useState } from "react";

const services = [
  { icon: "⌁", title: "ซ่อมโทรศัพท์", text: "เปลี่ยนจอ แบตเตอรี่ กล้อง และพอร์ตชาร์จ", tone: "blue" },
  { icon: "▱", title: "ซ่อมคอมพิวเตอร์", text: "แก้เครื่องช้า อัปเกรด และซ่อมฮาร์ดแวร์", tone: "cyan" },
  { icon: "✓", title: "รับประกันงานซ่อม", text: "ตรวจเช็กครบทุกจุด พร้อมรับประกันอะไหล่", tone: "navy" },
];

export default function HomeClient() {
  const [repairSent, setRepairSent] = useState(false);
  const [tracking, setTracking] = useState("");
  const [status, setStatus] = useState(false);

  function submitRepair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRepairSent(true);
  }

  function checkStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tracking.trim()) setStatus(true);
  }

  return (
    <main>
      <header className="site-header">
        <a href="/" className="brand" aria-label="FixIT Care หน้าหลัก">
          <span className="brand-mark">F</span>
          <span>FixIT <b>Care</b></span>
        </a>
        <nav className="main-nav" aria-label="เมนูหลัก">
          <a className="active" href="#home">หน้าหลัก</a>
          <a href="#services">บริการของเรา</a>
          <a href="#tracking">เช็กสถานะ</a>
          <a href="/payment">ชำระเงิน</a>
        </nav>
        <a href="/admin" className="button button-small button-outline">เข้าสู่ระบบ</a>
      </header>

      <section id="home" className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span>●</span> บริการซ่อมที่คุณวางใจได้</div>
          <h1>ทุกปัญหาอุปกรณ์<br /><span>เราพร้อมดูแล</span></h1>
          <p>ซ่อมโทรศัพท์และคอมพิวเตอร์โดยช่างผู้เชี่ยวชาญ<br className="desktop-break" /> ตรวจสอบสถานะได้ทุกขั้นตอน สะดวก โปร่งใส และรวดเร็ว</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#repair-form">แจ้งซ่อมออนไลน์ <span>→</span></a>
            <a className="button button-ghost" href="#tracking">⌕ เช็กสถานะงานซ่อม</a>
          </div>
          <div className="trust-row">
            <span><i>✓</i> ประเมินราคาฟรี</span>
            <span><i>✓</i> อะไหล่คุณภาพ</span>
            <span><i>✓</i> รับประกันงานซ่อม</span>
          </div>
        </div>

        <div id="repair-form" className="repair-card">
          <div className="card-heading">
            <div className="heading-icon">✦</div>
            <div><h2>แจ้งซ่อมออนไลน์</h2><p>กรอกข้อมูลเบื้องต้น เจ้าหน้าที่จะติดต่อกลับ</p></div>
          </div>
          {repairSent ? (
            <div className="success-box" role="status">
              <div className="success-icon">✓</div>
              <h3>รับเรื่องเรียบร้อยแล้ว</h3>
              <p>หมายเลขแจ้งซ่อมของคุณคือ <strong>FX-240812</strong><br />เจ้าหน้าที่จะติดต่อกลับภายใน 15 นาที</p>
              <button className="button button-primary full" onClick={() => setRepairSent(false)}>แจ้งซ่อมรายการใหม่</button>
            </div>
          ) : (
            <form onSubmit={submitRepair}>
              <div className="field-row">
                <label>ชื่อ–นามสกุล<input required placeholder="กรอกชื่อของคุณ" /></label>
                <label>เบอร์โทรศัพท์<input required inputMode="tel" placeholder="0xx-xxx-xxxx" /></label>
              </div>
              <label>ประเภทอุปกรณ์
                <select required defaultValue=""><option value="" disabled>เลือกประเภทอุปกรณ์</option><option>โทรศัพท์มือถือ</option><option>โน้ตบุ๊ก</option><option>คอมพิวเตอร์ตั้งโต๊ะ</option><option>แท็บเล็ต</option></select>
              </label>
              <label>อาการเบื้องต้น<textarea required placeholder="เช่น หน้าจอแตก เปิดไม่ติด เครื่องช้า..."></textarea></label>
              <button className="button button-primary full" type="submit">ส่งข้อมูลแจ้งซ่อม <span>→</span></button>
              <p className="form-note">◉ ข้อมูลของคุณจะถูกเก็บเป็นความลับ</p>
            </form>
          )}
        </div>
      </section>

      <section id="services" className="service-strip">
        {services.map((service) => (
          <article className="service-card" key={service.title}>
            <div className={`service-icon ${service.tone}`}>{service.icon}</div>
            <div><h3>{service.title}</h3><p>{service.text}</p></div>
            <span className="service-arrow">↗</span>
          </article>
        ))}
      </section>

      <section id="tracking" className="tracking-section">
        <div>
          <span className="section-label">ติดตามงานซ่อม</span>
          <h2>เช็กสถานะได้ทุกที่ ทุกเวลา</h2>
          <p>กรอกหมายเลขงานซ่อมที่ได้รับจากร้าน เช่น FX-240811</p>
        </div>
        <form className="tracking-form" onSubmit={checkStatus}>
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} required placeholder="กรอกหมายเลขงานซ่อม" aria-label="หมายเลขงานซ่อม" />
          <button className="button button-primary" type="submit">ตรวจสอบสถานะ</button>
        </form>
        {status && (
          <div className="status-result" role="status">
            <div><span className="status-dot"></span><strong>{tracking.toUpperCase()}</strong><small>iPhone 14 Pro · เปลี่ยนหน้าจอ</small></div>
            <span className="status-pill">กำลังดำเนินการซ่อม</span>
            <a href="/payment">ดูรายละเอียดและชำระเงิน →</a>
          </div>
        )}
      </section>

      <footer>
        <div className="brand"><span className="brand-mark">F</span><span>FixIT <b>Care</b></span></div>
        <p>ดูแลทุกอุปกรณ์ เหมือนเป็นของเราเอง</p>
        <span>© 2026 FixIT Care</span>
      </footer>

      <a className="line-float" href="https://line.me" target="_blank" rel="noreferrer" aria-label="แชตกับเราทางไลน์">
        <span className="line-icon">LINE</span><span>แชตกับเรา</span>
      </a>
    </main>
  );
}
