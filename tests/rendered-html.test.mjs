import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function renderHome() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the public FixIt Online customer home page", async () => {
  const response = await renderHome();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /FixIt Online/);
  assert.match(html, /เช็กสถานะงานซ่อมของคุณ/);
  assert.match(html, /เลือกประเภทอุปกรณ์ที่ต้องการซ่อม/);
});

test("provides a functional Thai and English language toggle", async () => {
  const [home, language, hook, wizard, status, payment] = await Promise.all([
    readFile(new URL("../app/HomeClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/useLanguage.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/repair/new/RepairWizard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/repair/status/[repairId]/RepairStatusClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/payment/PaymentClient.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(language, /type Language = "th" \| "en"/);
  assert.match(hook, /fixit-language|LANGUAGE_STORAGE_KEY/);
  assert.match(home + wizard + status + payment, /toggleLanguage/);
  assert.match(home, /Check your repair status/);
  assert.match(home, /เช็กสถานะงานซ่อมของคุณ/);
  assert.match(wizard, /What is wrong with your device/);
  assert.match(status, /Repair status/);
  assert.match(payment, /Pay your repair fee securely/);
});

test("uses app-owned admin authentication without ChatGPT auth", async () => {
  const [page, login, dashboard] = await Promise.all([
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminLogin.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /await getAdminSession\(\)/);
  assert.match(login, /action="\/api\/admin\/login"/);
  assert.match(login, /บัญชีเดียวสำหรับทั้งงานแอดมินและงานช่าง/);
  assert.doesNotMatch(login, /readOnly|defaultValue=\{adminEmail\}/);
  assert.doesNotMatch(page, /getAdminLoginEmail/);
  assert.match(dashboard, /action="\/api\/admin\/logout"/);
  assert.doesNotMatch(login + dashboard, /Sign in with ChatGPT|tech@fixitcare\.com|setRole/);
  await assert.rejects(access(new URL("../app/chatgpt-auth.ts", import.meta.url)));
});

test("protects passwords, sessions, and repeated login failures", async () => {
  const auth = await readFile(new URL("../app/admin-auth.ts", import.meta.url), "utf8");
  assert.match(auth, /PBKDF2/);
  assert.match(auth, /PASSWORD_ITERATIONS = 100000/);
  assert.match(auth, /MAX_FAILED_ATTEMPTS = 5/);
  assert.match(auth, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(auth, /tokenHash = await sha256\(token\)/);
});

test("ships the D1 authentication schema and migration", async () => {
  const [hosting, schema, migration] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_admin_auth.sql", import.meta.url), "utf8"),
  ]);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(schema, /adminUsers|adminSessions/);
  assert.match(migration, /CREATE TABLE `admin_users`/);
  assert.match(migration, /CREATE TABLE `admin_sessions`/);
});

test("ships the repair workflow, customer routes, and API endpoints", async () => {
  const [schema, migration, wizard, status, dashboard, api] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_repair_workflow.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/repair/new/RepairWizard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/repair/status/[repairId]/RepairStatusClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/repairs/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /customers|repairJobs|repairStatusHistory|notificationLogs/);
  assert.match(migration, /CREATE TABLE `repair_jobs`/);
  assert.match(wizard, /ขั้นตอนที่ 1 จาก 3|ยืนยันแจ้งซ่อม/);
  assert.match(status, /status-timeline|สถานะปัจจุบัน/);
  assert.match(dashboard, /repair-board|Repair Queue/);
  assert.match(api, /createRepair/);
});

test("ships pricing, payments, reports, notes, and password management", async () => {
  const [dashboard, detailsRoute, passwordRoute, migration] = await Promise.all([
    readFile(new URL("../app/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/repairs/[repairId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/change-password/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0002_repair_business_fields.sql", import.meta.url), "utf8"),
  ]);
  assert.match(dashboard, /ราคาสุทธิ|สถานะชำระเงิน|รายงานภาพรวม|เปลี่ยนรหัสผ่าน/);
  assert.match(detailsRoute, /updateRepairDetails/);
  assert.match(passwordRoute, /changeAdminPassword/);
  assert.match(migration, /final_price|payment_status|admin_note/);
});

test("stores real payment slips and protects admin review", async () => {
  const [hosting, schema, migration, upload, review, slip, page] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0003_payment_slips.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/payments/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/payments/[paymentId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/payments/[paymentId]/slip/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/payment/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(hosting, /"r2": "UPLOADS"/);
  assert.match(schema + migration, /payments|slip_key|idx_payments_status_created_at/);
  assert.match(upload, /5 \* 1024 \* 1024|image\/jpeg|env\.UPLOADS\.put|phoneSuffix/);
  assert.match(review + slip, /getAdminSession/);
  assert.match(page, /getRepair|getPaymentConfig/);
});

test("keeps LINE credentials server-side and verifies the connection", async () => {
  const [line, dashboard, statusRoute] = await Promise.all([
    readFile(new URL("../app/line.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/line/status/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(line, /env\.LINE_CHANNEL_ACCESS_TOKEN/);
  assert.match(line, /https:\/\/api\.line\.me\/v2\/bot\/info/);
  assert.match(line, /missing-recipient/);
  assert.match(dashboard, /lineConnection\.connected/);
  assert.match(dashboard, /\/api\/admin\/line\/test/);
  assert.match(statusRoute, /getAdminSession|getLineConnection/);
  assert.doesNotMatch(line + dashboard + statusRoute, /iBHbX0Ij6A5W9hpE/);
});

test("verifies LINE webhooks and sends linked customer status updates", async () => {
  const [line, webhook, statusRoute, migration] = await Promise.all([
    readFile(new URL("../app/line.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/line/webhook/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/repairs/[repairId]/status/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0004_customer_line_link.sql", import.meta.url), "utf8"),
  ]);
  assert.match(line, /LINE_CHANNEL_SECRET|crypto\.subtle\.verify|notifyRepairStatus/);
  assert.match(webhook, /x-line-signature|verifyLineSignature|linkCustomerLine/);
  assert.match(statusRoute, /notifyRepairStatus|recordNotification/);
  assert.match(migration, /line_user_id/);
});

test("requires a one-time token for initial password setup", async () => {
  const [setupPage, setupRoute] = await Promise.all([
    readFile(new URL("../app/admin/setup/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/setup/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(setupPage, /isValidSetupToken/);
  assert.match(setupRoute, /setupInitialAdmin/);
  assert.match(setupRoute, /confirmPassword/);
});

test("ships the complete repair customer-experience workflow", async () => {
  const [schema, migration, wizard, status, dashboard, repairs, richMenu, line] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0005_repair_customer_experience.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/repair/new/RepairWizard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/repair/status/[repairId]/RepairStatusClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/repairs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/line/rich-menu/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/line.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema + migration, /repairMedia|repairParts|repairQuotes|warranties|reviews|repair_media|repair_parts|repair_quotes/);
  assert.match(wizard, /otherSymptom|โปรดอธิบายอาการอื่น/);
  assert.match(wizard, /customer-priority|priority==="urgent"|การเลือกเร่งด่วนยังไม่ใช่การยืนยัน/);
  assert.match(repairs, /input\.priority/);
  assert.match(status, /customer-quote-card|digital-warranty|customer-review-card|repair-evidence-card/);
  assert.match(dashboard, /รูปก่อน–หลังซ่อม|อะไหล่ที่เปลี่ยน|ติดตั้งเป็นเมนูหลัก|ตรวจสอบและเผยแพร่รีวิว/);
  assert.match(repairs, /respondToQuote|ensureWarranty|createReview|moderateReview/);
  assert.match(status, /job\.status==="completed"&&job\.paymentStatus==="paid"/);
  assert.match(repairs, /repair\.status !== "completed" \|\| repair\.paymentStatus !== "paid"/);
  assert.match(richMenu, /getAdminSession|installDefaultRichMenu/);
  assert.match(line, /chatBarText: "เมนู FixIt"/);
  const richMenuImage = await stat(new URL("../public/line-rich-menu.jpg", import.meta.url));
  assert.ok(richMenuImage.size < 1024 * 1024);
  assert.match(dashboard, /line-rich-menu\.jpg|richMenuError/);
});

test("shows approved customer reviews publicly without exposing full names", async () => {
  const [route, home, repairs] = await Promise.all([
    readFile(new URL("../app/api/reviews/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/HomeClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/repairs.ts", import.meta.url), "utf8"),
  ]);
  assert.match(route + repairs, /listPublishedReviews|WHERE r\.status = 'published'/);
  assert.match(home, /public-reviews|customerName\.trim\(\)\.split/);
  assert.match(home, /96150/);
});

test("validates repair lookup and collects detailed device information", async () => {
  const [home, searchRoute, wizard] = await Promise.all([
    readFile(new URL("../app/HomeClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/repairs/search/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/repair/new/RepairWizard.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(home, /aria-invalid|invalidSearch|storefront-infographic\.png|บ้านเลขที่ 37 ม\.7/);
  assert.match(searchRoute, /validPhone|validRepairId|รูปแบบเบอร์โทรหรือรหัสงานไม่ถูกต้อง/);
  assert.match(wizard, /const brands|customDevice|otherBrand|deviceDetailsComplete/);
  await access(new URL("../public/storefront-infographic.png", import.meta.url));
});
