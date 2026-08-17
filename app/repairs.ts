import { env } from "cloudflare:workers";

export const repairStatuses = ["received", "checking", "repairing", "completed"] as const;
export type RepairStatus = (typeof repairStatuses)[number];

export type RepairJob = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  lineUserId: string | null;
  deviceType: string;
  deviceModel: string;
  symptoms: string[];
  note: string | null;
  status: RepairStatus;
  priority: "urgent" | "normal" | "low";
  estimatedMin: number | null;
  estimatedMax: number | null;
  finalPrice: number | null;
  paymentStatus: "unpaid" | "pending" | "paid";
  adminNote: string | null;
  createdAt: number;
  updatedAt: number;
  history: Array<{ status: RepairStatus; note: string | null; createdAt: number }>;
  media: RepairMedia[];
  parts: RepairPart[];
  quote: RepairQuote | null;
  warranty: RepairWarranty | null;
  review: RepairReview | null;
};

export type RepairMedia = { id: string; kind: "before" | "after" | "part"; caption: string | null; createdAt: number };
export type RepairPart = { id: string; name: string; quantity: number; unitPrice: number; warrantyDays: number };
export type RepairQuote = { laborAmount: number; partsAmount: number; totalAmount: number; note: string | null; status: "pending" | "approved" | "rejected"; respondedAt: number | null };
export type RepairWarranty = { warrantyNumber: string; startsAt: number; endsAt: number; terms: string };
export type RepairReview = { id: string; rating: number; comment: string | null; status: "pending" | "published" | "rejected"; createdAt: number };

type RepairRow = {
  id: string; customer_id: string; customer_name: string; phone: string; line_user_id: string | null;
  device_type: string; device_model: string; symptoms: string; note: string | null;
  status: RepairStatus; priority: "urgent" | "normal" | "low";
  estimated_min: number | null; estimated_max: number | null; final_price: number | null;
  payment_status: "unpaid" | "pending" | "paid"; admin_note: string | null; created_at: number; updated_at: number;
};

function db() {
  if (!env.DB) throw new Error("Repair database is unavailable");
  return env.DB;
}

function repairCode() {
  const date = new Date();
  const day = `${date.getFullYear()}`.slice(-2) + `${date.getMonth() + 1}`.padStart(2, "0") + `${date.getDate()}`.padStart(2, "0");
  return `REP-${day}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

function parseSymptoms(value: string): string[] {
  try { return JSON.parse(value) as string[]; } catch { return [value]; }
}

async function withHistory(row: RepairRow): Promise<RepairJob> {
  const [history, media, parts, quote, warranty, review] = await Promise.all([
    db().prepare("SELECT status, note, created_at AS createdAt FROM repair_status_history WHERE repair_id = ? ORDER BY created_at ASC").bind(row.id).all<{ status: RepairStatus; note: string | null; createdAt: number }>(),
    db().prepare("SELECT id, kind, caption, created_at AS createdAt FROM repair_media WHERE repair_id = ? ORDER BY created_at ASC").bind(row.id).all<RepairMedia>(),
    db().prepare("SELECT id, name, quantity, unit_price AS unitPrice, warranty_days AS warrantyDays FROM repair_parts WHERE repair_id = ? ORDER BY created_at ASC").bind(row.id).all<RepairPart>(),
    db().prepare("SELECT labor_amount AS laborAmount, total_amount AS totalAmount, note, status, responded_at AS respondedAt FROM repair_quotes WHERE repair_id = ? LIMIT 1").bind(row.id).first<Omit<RepairQuote, "partsAmount">>(),
    db().prepare("SELECT warranty_number AS warrantyNumber, starts_at AS startsAt, ends_at AS endsAt, terms FROM warranties WHERE repair_id = ? LIMIT 1").bind(row.id).first<RepairWarranty>(),
    db().prepare("SELECT id, rating, comment, status, created_at AS createdAt FROM reviews WHERE repair_id = ? LIMIT 1").bind(row.id).first<RepairReview>(),
  ]);
  const partsAmount = parts.results.reduce((sum: number, part: RepairPart) => sum + part.quantity * part.unitPrice, 0);
  return {
    id: row.id, customerId: row.customer_id, customerName: row.customer_name, phone: row.phone, lineUserId: row.line_user_id,
    deviceType: row.device_type, deviceModel: row.device_model, symptoms: parseSymptoms(row.symptoms),
    note: row.note, status: row.status, priority: row.priority, estimatedMin: row.estimated_min,
    estimatedMax: row.estimated_max, createdAt: row.created_at, updatedAt: row.updated_at,
    finalPrice: row.final_price, paymentStatus: row.payment_status, adminNote: row.admin_note,
    history: history.results, media: media.results, parts: parts.results,
    quote: quote ? { ...quote, partsAmount } : null, warranty: warranty ?? null, review: review ?? null,
  };
}

const selectJob = `SELECT j.*, c.name AS customer_name, c.phone AS phone, c.line_user_id AS line_user_id
  FROM repair_jobs j JOIN customers c ON c.id = j.customer_id`;

export async function createRepair(input: {
  name: string; phone: string; email?: string; deviceType: string; deviceModel: string; symptoms: string[]; note?: string; priority: "normal" | "urgent";
}): Promise<RepairJob> {
  const now = Math.floor(Date.now() / 1000);
  const customerId = crypto.randomUUID();
  const id = repairCode();
  await db().batch([
    db().prepare("INSERT INTO customers (id, name, phone, email, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(customerId, input.name, input.phone, input.email || null, now),
    db().prepare("INSERT INTO repair_jobs (id, customer_id, device_type, device_model, symptoms, note, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'received', ?, ?, ?)")
      .bind(id, customerId, input.deviceType, input.deviceModel, JSON.stringify(input.symptoms), input.note || null, input.priority, now, now),
    db().prepare("INSERT INTO repair_status_history (id, repair_id, status, note, created_at) VALUES (?, ?, 'received', ?, ?)")
      .bind(crypto.randomUUID(), id, "รับข้อมูลแจ้งซ่อมแล้ว", now),
  ]);
  const job = await getRepair(id);
  if (!job) throw new Error("Unable to create repair job");
  return job;
}

export async function getRepair(id: string): Promise<RepairJob | null> {
  const row = await db().prepare(`${selectJob} WHERE UPPER(j.id) = UPPER(?) LIMIT 1`).bind(id.trim()).first<RepairRow>();
  return row ? withHistory(row) : null;
}

export async function searchRepair(query: string): Promise<RepairJob | null> {
  const value = query.trim();
  const row = await db().prepare(`${selectJob} WHERE UPPER(j.id) = UPPER(?) OR c.phone = ? ORDER BY j.updated_at DESC LIMIT 1`)
    .bind(value, value.replace(/\D/g, "")).first<RepairRow>();
  return row ? withHistory(row) : null;
}

export async function listRepairs(): Promise<RepairJob[]> {
  const rows = await db().prepare(`${selectJob} ORDER BY j.updated_at DESC LIMIT 100`).all<RepairRow>();
  return Promise.all(rows.results.map(withHistory));
}

export async function updateRepairStatus(id: string, status: RepairStatus, note?: string): Promise<RepairJob | null> {
  const now = Math.floor(Date.now() / 1000);
  await db().batch([
    db().prepare("UPDATE repair_jobs SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, id),
    db().prepare("INSERT INTO repair_status_history (id, repair_id, status, note, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), id, status, note || null, now),
  ]);
  if (status === "completed") await ensureWarranty(id, now);
  return getRepair(id);
}

export async function updateRepairDetails(id: string, input: {
  priority: "urgent" | "normal" | "low"; estimatedMin: number | null; estimatedMax: number | null;
  finalPrice: number | null; paymentStatus: "unpaid" | "pending" | "paid"; adminNote: string | null;
}): Promise<RepairJob | null> {
  const now = Math.floor(Date.now() / 1000);
  await db().prepare("UPDATE repair_jobs SET priority = ?, estimated_min = ?, estimated_max = ?, final_price = ?, payment_status = ?, admin_note = ?, updated_at = ? WHERE id = ?")
    .bind(input.priority, input.estimatedMin, input.estimatedMax, input.finalPrice, input.paymentStatus, input.adminNote, now, id).run();
  return getRepair(id);
}

export async function linkCustomerLine(customerId: string, lineUserId: string): Promise<void> {
  await db().prepare("UPDATE customers SET line_user_id = ? WHERE id = ?").bind(lineUserId, customerId).run();
}

export async function recordNotification(repairId: string, channel: string, status: string): Promise<void> {
  await db().prepare("INSERT INTO notification_logs (id, repair_id, channel, status, sent_at) VALUES (?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), repairId, channel, status, Math.floor(Date.now() / 1000)).run();
}

export async function replaceRepairParts(repairId: string, parts: Array<{ name: string; quantity: number; unitPrice: number; warrantyDays: number }>): Promise<RepairJob | null> {
  const now = Math.floor(Date.now() / 1000);
  const statements = [db().prepare("DELETE FROM repair_parts WHERE repair_id = ?").bind(repairId)];
  for (const part of parts) {
    statements.push(db().prepare("INSERT INTO repair_parts (id, repair_id, name, quantity, unit_price, warranty_days, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), repairId, part.name, part.quantity, part.unitPrice, part.warrantyDays, now));
  }
  statements.push(db().prepare("UPDATE repair_jobs SET updated_at = ? WHERE id = ?").bind(now, repairId));
  await db().batch(statements);
  return getRepair(repairId);
}

export async function addRepairMedia(input: { repairId: string; kind: RepairMedia["kind"]; objectKey: string; originalName: string; contentType: string; caption: string | null }): Promise<RepairMedia> {
  const id = crypto.randomUUID();
  const createdAt = Math.floor(Date.now() / 1000);
  await db().prepare("INSERT INTO repair_media (id, repair_id, kind, object_key, original_name, content_type, caption, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, input.repairId, input.kind, input.objectKey, input.originalName, input.contentType, input.caption, createdAt).run();
  return { id, kind: input.kind, caption: input.caption, createdAt };
}

export async function getRepairMedia(repairId: string, mediaId: string): Promise<{ objectKey: string; contentType: string; originalName: string } | null> {
  return db().prepare("SELECT object_key AS objectKey, content_type AS contentType, original_name AS originalName FROM repair_media WHERE repair_id = ? AND id = ? LIMIT 1")
    .bind(repairId, mediaId).first<{ objectKey: string; contentType: string; originalName: string }>();
}

export async function upsertRepairQuote(repairId: string, laborAmount: number, note: string | null): Promise<RepairJob | null> {
  const parts = await db().prepare("SELECT quantity, unit_price AS unitPrice FROM repair_parts WHERE repair_id = ?").bind(repairId).all<{ quantity: number; unitPrice: number }>();
  const partsAmount = parts.results.reduce((sum: number, part: { quantity: number; unitPrice: number }) => sum + part.quantity * part.unitPrice, 0);
  const totalAmount = partsAmount + laborAmount;
  const now = Math.floor(Date.now() / 1000);
  await db().prepare(`INSERT INTO repair_quotes (id, repair_id, labor_amount, total_amount, note, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
    ON CONFLICT(repair_id) DO UPDATE SET labor_amount = excluded.labor_amount, total_amount = excluded.total_amount, note = excluded.note, status = 'pending', responded_at = NULL, updated_at = excluded.updated_at`)
    .bind(crypto.randomUUID(), repairId, laborAmount, totalAmount, note, now, now).run();
  await db().prepare("UPDATE repair_jobs SET estimated_min = ?, estimated_max = ?, final_price = ?, updated_at = ? WHERE id = ?")
    .bind(totalAmount, totalAmount, totalAmount, now, repairId).run();
  return getRepair(repairId);
}

export async function respondToQuote(repairId: string, decision: "approved" | "rejected", phoneSuffix: string): Promise<RepairJob | null> {
  const repair = await getRepair(repairId);
  if (!repair || !repair.phone.replace(/\D/g, "").endsWith(phoneSuffix)) return null;
  const now = Math.floor(Date.now() / 1000);
  await db().prepare("UPDATE repair_quotes SET status = ?, responded_at = ?, updated_at = ? WHERE repair_id = ? AND status = 'pending'")
    .bind(decision, now, now, repairId).run();
  return getRepair(repairId);
}

async function ensureWarranty(repairId: string, now: number): Promise<void> {
  const parts = await db().prepare("SELECT warranty_days AS warrantyDays FROM repair_parts WHERE repair_id = ?").bind(repairId).all<{ warrantyDays: number }>();
  const warrantyDays = Math.max(30, ...parts.results.map((part: { warrantyDays: number }) => part.warrantyDays));
  const endsAt = now + warrantyDays * 86400;
  const warrantyNumber = `WR-${repairId.replace(/^REP-/, "")}`;
  await db().prepare("INSERT OR IGNORE INTO warranties (id, repair_id, warranty_number, starts_at, ends_at, terms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), repairId, warrantyNumber, now, endsAt, "รับประกันเฉพาะรายการซ่อมและอะไหล่ที่ระบุ ไม่รวมความเสียหายจากอุบัติเหตุ น้ำ หรือการใช้งานผิดวิธี", now).run();
}

export async function createReview(repairId: string, rating: number, comment: string | null, phoneSuffix: string): Promise<RepairReview | null> {
  const repair = await getRepair(repairId);
  if (!repair || repair.status !== "completed" || repair.paymentStatus !== "paid" || !repair.phone.replace(/\D/g, "").endsWith(phoneSuffix)) return null;
  const id = crypto.randomUUID();
  const createdAt = Math.floor(Date.now() / 1000);
  await db().prepare("INSERT INTO reviews (id, repair_id, rating, comment, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)")
    .bind(id, repairId, rating, comment, createdAt).run();
  return { id, rating, comment, status: "pending", createdAt };
}

export async function listReviews(): Promise<Array<RepairReview & { repairId: string; customerName: string; deviceModel: string }>> {
  const rows = await db().prepare(`SELECT r.id, r.repair_id AS repairId, r.rating, r.comment, r.status, r.created_at AS createdAt,
    c.name AS customerName, j.device_model AS deviceModel FROM reviews r JOIN repair_jobs j ON j.id = r.repair_id JOIN customers c ON c.id = j.customer_id ORDER BY r.created_at DESC`).all<RepairReview & { repairId: string; customerName: string; deviceModel: string }>();
  return rows.results;
}

export async function moderateReview(id: string, status: "published" | "rejected"): Promise<void> {
  await db().prepare("UPDATE reviews SET status = ?, reviewed_at = ? WHERE id = ?").bind(status, Math.floor(Date.now() / 1000), id).run();
}
