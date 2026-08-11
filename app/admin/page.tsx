"use client";

import { FormEvent, useState } from "react";

const jobs = [
  { id: "FX-240811", customer: "คุณกิตติพงษ์", device: "iPhone 14 Pro", issue: "เปลี่ยนหน้าจอ", status: "กำลังซ่อม", className: "progress" },
  { id: "FX-240810", customer: "คุณอรทัย", device: "MacBook Air M2", issue: "เปิดไม่ติด", status: "รอตรวจสอบ", className: "waiting" },
  { id: "FX-240809", customer: "คุณธนวัฒน์", device: "Samsung S24", issue: "พอร์ตชาร์จเสีย", status: "พร้อมรับ", className: "ready" },
  { id: "FX-240808", customer: "คุณศิริพร", device: "ASUS TUF F15", issue: "เครื่องร้อน", status: "รออะไหล่", className: "parts" },
];

export default function AdminPage() {
  const [role, setRole] = useState<"admin" | "tech">("admin");
  const [loggedIn, setLoggedIn] = useState(false);

  function login(event: FormEvent) { event.preventDefault(); setLoggedIn(true); }

  if (loggedIn) {
    return (
      <main className="dashboard">
        <aside className="sidebar">
          <div className="brand brand-white"><span className="brand-mark">F</span><span>FixIT <b>Care</b></span></div>
          <div className="user-mini"><span>{role === "admin" ? "AM" : "TC"}</span><div><strong>{role === "admin" ? "อรอนงค์ มั่นคง" : "ช่างนนท์ ใจดี"}</strong><small>{role === "admin" ? "ผู้ดูแลระบบ" : "ช่างเทคนิค"}</small></div></div>
          <nav><a className="selected">⌂ ภาพรวม</a><a>▣ งานซ่อมทั้งหมด <b>12</b></a><a>♙ ลูกค้า</a><a>▱ อะไหล่และสต็อก</a><a>฿ การชำระเงิน</a>{role === "admin" && <a>⚙ จัดการผู้ใช้งาน</a>}</nav>
          <button className="logout" onClick={() => setLoggedIn(false)}>↪ ออกจากระบบ</button>
        </aside>
        <section className="dashboard-content">
          <header><div><p>วันอังคารที่ 11 สิงหาคม 2569</p><h1>สวัสดี, {role === "admin" ? "คุณอรอนงค์" : "ช่างนนท์"} 👋</h1></div><div className="header-tools"><button aria-label="การแจ้งเตือน">♢<i></i></button><button className="button button-primary">＋ เพิ่มงานซ่อม</button></div></header>
          <div className="stats-grid">
            <article><span className="stat-icon blue">▣</span><div><small>งานซ่อมทั้งหมด</small><strong>128</strong><p><b>↑ 12%</b> จากเดือนที่แล้ว</p></div></article>
            <article><span className="stat-icon amber">⌛</span><div><small>กำลังดำเนินการ</small><strong>12</strong><p>ต้องดูแลวันนี้ <b>5 งาน</b></p></div></article>
            <article><span className="stat-icon green">✓</span><div><small>เสร็จแล้วเดือนนี้</small><strong>86</strong><p><b>↑ 8%</b> จากเดือนที่แล้ว</p></div></article>
            <article><span className="stat-icon purple">฿</span><div><small>รายได้เดือนนี้</small><strong>฿124,500</strong><p><b>↑ 18%</b> จากเดือนที่แล้ว</p></div></article>
          </div>
          <section className="jobs-panel">
            <div className="panel-title"><div><h2>งานซ่อมล่าสุด</h2><p>รายการงานซ่อมที่มีการอัปเดตล่าสุด</p></div><button>ดูทั้งหมด →</button></div>
            <div className="job-table">
              <div className="table-head"><span>หมายเลขงาน</span><span>ลูกค้า / อุปกรณ์</span><span>อาการ</span><span>สถานะ</span><span>จัดการ</span></div>
              {jobs.map((job) => <div className="table-row" key={job.id}><strong>{job.id}</strong><span><b>{job.customer}</b><small>{job.device}</small></span><span>{job.issue}</span><span><i className={job.className}>{job.status}</i></span><button>•••</button></div>)}
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <a href="/" className="brand brand-white"><span className="brand-mark">F</span><span>FixIT <b>Care</b></span></a>
        <div><span className="showcase-badge">ระบบจัดการร้านซ่อมครบวงจร</span><h1>บริหารงานซ่อม<br />ให้เป็นเรื่องง่าย</h1><p>จัดการงานซ่อม ลูกค้า อะไหล่ และการชำระเงิน<br />ทุกอย่างในที่เดียว</p><div className="feature-list"><span>✓ ติดตามงานแบบเรียลไทม์</span><span>✓ แบ่งสิทธิ์แอดมินและช่าง</span><span>✓ สรุปรายได้และสถิติ</span></div></div>
        <small>© 2026 FixIT Care Management System</small>
      </section>
      <section className="login-panel">
        <div className="login-box">
          <a href="/" className="mobile-brand brand"><span className="brand-mark">F</span><span>FixIT <b>Care</b></span></a>
          <span className="section-label">ยินดีต้อนรับกลับ</span><h2>เข้าสู่ระบบจัดการ</h2><p>กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน</p>
          <div className="role-switch"><button className={role === "admin" ? "selected" : ""} onClick={() => setRole("admin")}>♟ แอดมิน</button><button className={role === "tech" ? "selected" : ""} onClick={() => setRole("tech")}>⚒ ช่าง</button></div>
          <form onSubmit={login}>
            <label>อีเมล<input required type="email" defaultValue={role === "admin" ? "admin@fixitcare.com" : "tech@fixitcare.com"} key={role} /></label>
            <label>รหัสผ่าน<div className="password-field"><input required type="password" defaultValue="12345678" /><span>◉</span></div></label>
            <div className="login-options"><label><input type="checkbox" defaultChecked /> จดจำฉันไว้</label><a>ลืมรหัสผ่าน?</a></div>
            <button className="button button-primary full" type="submit">เข้าสู่ระบบ →</button>
          </form>
          <p className="demo-note">ทดลองใช้งาน: เลือกบทบาทแล้วกดเข้าสู่ระบบได้ทันที</p>
          <a className="back-link center" href="/">← กลับไปยังหน้าลูกค้า</a>
        </div>
      </section>
    </main>
  );
}
