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
        <a href="/" className="brand brand-white"><span className="brand-mark">F</span><span>FixIt <b>Online</b></span></a>
        <div><span className="showcase-badge">ระบบจัดการร้านซ่อมสำหรับเจ้าของร้าน</span><h1>บริหารงานซ่อม<br />ได้ในที่เดียว</h1><p>รับงาน ตรวจเช็ก อัปเดตสถานะ และติดตามคิวซ่อม<br />ด้วยบัญชีแอดมินเพียงบัญชีเดียว</p><div className="feature-list"><span>✓ เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน</span><span>✓ ไม่มีบัญชีช่างแยก</span><span>✓ ไม่ใช้บัญชี ChatGPT เป็นบัญชีแอดมิน</span></div></div>
        <small>© 2026 FixIt Online Management System</small>
      </section>
      <section className="login-panel"><div className="login-box">
        <a href="/" className="mobile-brand brand"><span className="brand-mark">F</span><span>FixIt <b>Online</b></span></a>
        <span className="section-label">สำหรับแอดมิน</span><h2>เข้าสู่ระบบจัดการ</h2><p>ใช้บัญชีแอดมินของร้านเพื่อจัดการและอัปเดตงานซ่อม</p>
        {setupComplete && <p className="auth-message success">สร้างบัญชีสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านที่เพิ่งตั้ง</p>}
        {error && <p className="auth-message error" role="alert">{errors[error] ?? "ไม่สามารถเข้าสู่ระบบได้"}</p>}
        {!configured ? <div className="auth-message notice"><strong>ยังไม่ได้สร้างบัญชีแอดมิน</strong><br />เปิดลิงก์ตั้งค่าครั้งแรกและสร้างรหัสผ่านก่อนเข้าสู่ระบบ</div> : <form action="/api/admin/login" method="post"><label>อีเมลแอดมิน<input required type="email" name="email" autoComplete="username" placeholder="admin@example.com" /></label><label>รหัสผ่าน<div className="password-field"><input required type="password" name="password" minLength={12} autoComplete="current-password" placeholder="กรอกรหัสผ่านแอดมิน" /></div></label><button className="button button-primary full" type="submit">เข้าสู่ระบบ →</button></form>}
        <p className="auth-mode-note">บัญชีเดียวสำหรับทั้งงานแอดมินและงานช่าง</p><a className="back-link center" href="/">← กลับไปหน้าลูกค้า</a>
      </div></section>
    </main>
  );
}
