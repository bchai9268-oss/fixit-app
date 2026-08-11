import { chatGPTSignOutPath } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default function UnauthorizedPage() {
  return (
    <main className="access-page">
      <section className="access-card">
        <div className="access-icon">!</div>
        <span className="section-label">ไม่สามารถเข้าใช้งานได้</span>
        <h1>บัญชีนี้ไม่มีสิทธิ์แอดมิน</h1>
        <p>ระบบหลังบ้านสงวนไว้สำหรับผู้ดูแลที่ได้รับอนุญาตเท่านั้น<br />กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน</p>
        <div className="access-actions">
          <a className="button button-primary" href={chatGPTSignOutPath("/admin")}>เปลี่ยนบัญชี</a>
          <a className="button button-ghost" href="/">กลับหน้าหลัก</a>
        </div>
      </section>
    </main>
  );
}
