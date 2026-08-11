"use client";

import Link from "next/link";
import { useState } from "react";

export default function PaymentPage() {
  const [method, setMethod] = useState("qr");
  const [paid, setPaid] = useState(false);

  return (
    <main className="app-shell">
      <header className="site-header">
        <Link href="/" className="brand"><span className="brand-mark">F</span><span>FixIT <b>Care</b></span></Link>
        <nav className="main-nav"><Link href="/">หน้าหลัก</Link><Link href="/#tracking">เช็กสถานะ</Link><Link className="active" href="/payment">ชำระเงิน</Link></nav>
        <Link href="/admin" className="button button-small button-outline">เข้าสู่ระบบ</Link>
      </header>

      <section className="payment-wrap">
        <div className="page-intro">
          <Link href="/" className="back-link">← กลับหน้าหลัก</Link>
          <span className="section-label">ชำระเงินออนไลน์</span>
          <h1>ชำระค่าบริการอย่างปลอดภัย</h1>
          <p>ตรวจสอบรายละเอียดงานซ่อมและเลือกช่องทางชำระเงิน</p>
        </div>

        <div className="payment-grid">
          <section className="invoice-card">
            <div className="invoice-head"><div><small>หมายเลขงานซ่อม</small><h2>FX-240811</h2></div><span className="ready-pill">พร้อมรับเครื่อง</span></div>
            <div className="device-summary"><span className="device-icon">▯</span><div><strong>iPhone 14 Pro · Space Black</strong><p>เปลี่ยนหน้าจอ OLED พร้อมติดฟิล์มกระจก</p></div></div>
            <div className="repair-timeline">
              <div className="done"><i>✓</i><span>รับเครื่อง</span></div><b></b>
              <div className="done"><i>✓</i><span>ตรวจสอบ</span></div><b></b>
              <div className="done"><i>✓</i><span>ซ่อมเสร็จ</span></div><b></b>
              <div className="current"><i>4</i><span>ชำระเงิน</span></div>
            </div>
            <div className="bill-lines">
              <div><span>หน้าจอ OLED เกรดพรีเมียม</span><strong>฿3,500</strong></div>
              <div><span>ค่าบริการเปลี่ยนหน้าจอ</span><strong>฿500</strong></div>
              <div><span>ฟิล์มกระจก (โปรโมชัน)</span><strong className="free">ฟรี</strong></div>
              <div className="total"><span>ยอดชำระทั้งหมด</span><strong>฿4,000</strong></div>
            </div>
            <p className="warranty-note">✦ รับประกันงานซ่อมและอะไหล่ 90 วัน</p>
          </section>

          <section className="checkout-card">
            {paid ? (
              <div className="success-box payment-success"><div className="success-icon">✓</div><h2>ส่งหลักฐานแล้ว</h2><p>เรากำลังตรวจสอบยอดชำระ<br />จะแจ้งผลให้ทราบภายใน 10 นาที</p><Link className="button button-primary full" href="/">กลับหน้าหลัก</Link></div>
            ) : (
              <>
                <h2>เลือกช่องทางชำระเงิน</h2>
                <div className="method-tabs">
                  <button className={method === "qr" ? "selected" : ""} onClick={() => setMethod("qr")}><span>▦</span> QR พร้อมเพย์</button>
                  <button className={method === "bank" ? "selected" : ""} onClick={() => setMethod("bank")}><span>▤</span> โอนธนาคาร</button>
                </div>
                {method === "qr" ? (
                  <div className="qr-area"><small>สแกนเพื่อชำระ</small><div className="qr-code" aria-label="ตัวอย่างคิวอาร์โค้ด"><span>FIXIT</span></div><strong>฿4,000.00</strong><p>FixIT Care Co., Ltd.</p></div>
                ) : (
                  <div className="bank-area"><div className="bank-logo">K</div><div><small>ธนาคารกสิกรไทย</small><strong>123-4-56789-0</strong><p>บริษัท ฟิกซ์ไอที แคร์ จำกัด</p></div></div>
                )}
                <label className="upload-box"><input type="file" accept="image/*" /><span>＋</span><strong>แนบหลักฐานการชำระเงิน</strong><small>รองรับ JPG, PNG ขนาดไม่เกิน 5MB</small></label>
                <button className="button button-primary full" onClick={() => setPaid(true)}>ยืนยันการชำระเงิน →</button>
                <p className="secure-note">⌾ การชำระเงินของคุณได้รับการปกป้องอย่างปลอดภัย</p>
              </>
            )}
          </section>
        </div>
      </section>
      <a className="line-float" href="https://line.me" target="_blank" rel="noreferrer"><span className="line-icon">LINE</span><span>แชตกับเรา</span></a>
    </main>
  );
}
