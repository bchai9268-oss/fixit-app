import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

test("uses app-owned admin authentication without ChatGPT auth", async () => {
  const [page, login, dashboard] = await Promise.all([
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminLogin.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /await getAdminSession\(\)/);
  assert.match(login, /action="\/api\/admin\/login"/);
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

test("requires a one-time token for initial password setup", async () => {
  const [setupPage, setupRoute] = await Promise.all([
    readFile(new URL("../app/admin/setup/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/setup/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(setupPage, /isValidSetupToken/);
  assert.match(setupRoute, /setupInitialAdmin/);
  assert.match(setupRoute, /confirmPassword/);
});
