import { hasAdminAccount, isValidSetupToken } from "../../admin-auth";

export const dynamic = "force-dynamic";

type SetupPageProps = { searchParams: Promise<{ token?: string; error?: string }> };

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const params = await searchParams;
  const configured = await hasAdminAccount();
  const validToken = !configured && await isValidSetupToken(params.token ?? "");

  if (!validToken) {
    return (
      <main className="access-page"><section className="access-card"><div className="access-icon">!</div><span className="section-label">ตั้งค่าบัญชีแอดมิน</span><h1>{configured ? "บัญชีถูกตั้งค่าแล้ว" : "ลิงก์ตั้งค่าไม่ถูกต้อง"}</h1><p>{configured ? "กรุณาเข้าสู่ระบบด้วยบัญชีแอดมินที่ตั้งค่าไว้" : "ลิงก์อาจไม่ถูกต้องหรือหมดอายุ กรุณาตรวจสอบลิงก์อีกครั้ง"}</p><div className="access-actions"><a className="button button-primary" href="/admin">ไปหน้าเข้าสู่ระบบ</a></div></section></main>
    );
  }

  return (
    <main className="access-page"><section className="access-card setup-card"><div className="access-icon secure">✓</div><span className="section-label">ตั้งค่าครั้งแรก</span><h1>สร้างรหัสผ่านแอดมิน</h1><p>รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร</p>{params.error === "mismatch" && <p className="auth-message error">รหัสผ่านทั้งสองช่องไม่ตรงกัน</p>}{params.error === "weak-password" && <p className="auth-message error">รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร</p>}<form action="/api/admin/setup" method="post"><input type="hidden" name="token" value={params.token} /><label>รหัสผ่านใหม่<input required type="password" name="password" minLength={12} autoComplete="new-password" /></label><label>ยืนยันรหัสผ่าน<input required type="password" name="confirmPassword" minLength={12} autoComplete="new-password" /></label><button className="button button-primary full" type="submit">สร้างบัญชีแอดมิน</button></form></section></main>
  );
}
