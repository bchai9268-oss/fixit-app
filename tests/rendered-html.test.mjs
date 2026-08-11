import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isAdminEmail } from "../app/admin-permissions.ts";

async function renderHome() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the FixIT Care customer home page", async () => {
  const response = await renderHome();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /FixIT Care/);
  assert.match(html, /แจ้งซ่อมออนไลน์/);
});

test("matches only emails in the normalized admin allowlist", () => {
  const allowlist = "owner@example.com, second@example.com";
  assert.equal(isAdminEmail("OWNER@example.com", allowlist), true);
  assert.equal(isAdminEmail(" second@example.com ", allowlist), true);
  assert.equal(isAdminEmail("outsider@example.com", allowlist), false);
  assert.equal(isAdminEmail("", allowlist), false);
});

test("protects the admin route on the server", async () => {
  const [page, auth, dashboard] = await Promise.all([
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /dynamic\s*=\s*"force-dynamic"/);
  assert.match(page, /await requireAdmin\(\)/);
  assert.match(auth, /await requireChatGPTUser\("\/admin"\)/);
  assert.match(auth, /redirect\("\/unauthorized"\)/);
  assert.doesNotMatch(dashboard, /tech@fixitcare\.com|12345678|ช่างนนท์|setRole/);
});

test("provides an unauthorized account recovery path", async () => {
  const page = await readFile(new URL("../app/unauthorized/page.tsx", import.meta.url), "utf8");
  assert.match(page, /บัญชีนี้ไม่มีสิทธิ์แอดมิน/);
  assert.match(page, /chatGPTSignOutPath\("\/admin"\)/);
});
