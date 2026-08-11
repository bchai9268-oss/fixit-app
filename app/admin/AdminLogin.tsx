/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a vinext client-navigation runtime bug. */

type AdminLoginProps = { error?: string; setupComplete: boolean; configured: boolean };

const errors: Record<string, string> = {
  "invalid-credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  locked: "บัญชีถูกล็อกชั่วคราว กรุณาลองอีกครั้งใน 15 นาที",
  required: "กรุณากรอกอีเมลและรหัสผ่าน",
};

export default function AdminLogin({ error, setupComplete, configured }: AdminLoginProps) {
  return (
    <main className="login-page">
      <section className="login-showcase">
        <a href="/" className="brand brand-white"><span className="brand-mark">F</span><span>FixIT <b>Care</b></span></a>
        <div><span className="showcase-badge">ระบบจัดการร้านซ่อมครบวงจร</span><h1>บริหารงานซ่อม<br />ให้เป็นเรื่องง่าย</h1><p>จัดการงานซ่อม ลูกค้า อะไหล่ และการชำระเงิน<br />ทุกอย่างในที่เดียว</p><div className="feature-list"><span>✓ ปกป้องข้อมูลด้วยเซสชันที่ปลอดภัย</span><span>✓ สำหรับผู้ดูแลระบบเท่านั้น</span><span>✓ สรุปรายได้และสถิติ</span></div></div>
        <small>© 2026 FixIT Care Management System</small>
      </section>
      <section className="login-panel">
        <div className="login-box">
          <a href="/" className="mobile-brand brand"><span className="brand-mark">F</span><span>FixIT <b>Care</b></span></a>
          <span className="section-label">สำหรับผู้ดูแลระบบ</span><h2>เข้าสู่ระบบจัดการ</h2><p>กรอกอีเมลและรหัสผ่านแอดมินเพื่อเข้าใช้งาน</p>
          {setupComplete && <p className="auth-message success">ตั้งค่าบัญชีสำเร็จแล้ว กรุณาเข้าสู่ระบบ</p>}
          {error && <p className="auth-message error" role="alert">{errors[error] ?? "ไม่สามารถเข้าสู่ระบบได้"}</p>}
          {!configured ? (
            <div className="auth-message notice"><strong>ยังไม่ได้ตั้งค่าบัญชีแอดมิน</strong><br />กรุณาใช้ลิงก์ตั้งค่าครั้งแรกที่ได้รับจากผู้ดูแลเว็บไซต์</div>
          ) : (
            <form action="/api/admin/login" method="post">
              <label>อีเมล<input required type="email" name="email" autoComplete="username" placeholder="admin@example.com" /></label>
              <label>รหัสผ่าน<div className="password-field"><input required type="password" name="password" minLength={12} autoComplete="current-password" placeholder="กรอกรหัสผ่าน" /></div></label>
              <button className="button button-primary full" type="submit">เข้าสู่ระบบ →</button>
            </form>
          )}
          <a className="back-link center" href="/">← กลับไปยังหน้าลูกค้า</a>
        </div>
      </section>
    </main>
  );
}
