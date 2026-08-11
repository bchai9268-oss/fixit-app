import { env } from "cloudflare:workers";

export const repairStatuses = ["received", "checking", "repairing", "completed"] as const;
export type RepairStatus = (typeof repairStatuses)[number];

export type RepairJob = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  deviceType: string;
  deviceModel: string;
  symptoms: string[];
  note: string | null;
  status: RepairStatus;
  priority: "urgent" | "normal" | "low";
  estimatedMin: number | null;
  estimatedMax: number | null;
  createdAt: number;
  updatedAt: number;
  history: Array<{ status: RepairStatus; note: string | null; createdAt: number }>;
};

type RepairRow = {
  id: string; customer_id: string; customer_name: string; phone: string;
  device_type: string; device_model: string; symptoms: string; note: string | null;
  status: RepairStatus; priority: "urgent" | "normal" | "low";
  estimated_min: number | null; estimated_max: number | null; created_at: number; updated_at: number;
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
  const history = await db().prepare(
    "SELECT status, note, created_at AS createdAt FROM repair_status_history WHERE repair_id = ? ORDER BY created_at ASC",
  ).bind(row.id).all<{ status: RepairStatus; note: string | null; createdAt: number }>();
  return {
    id: row.id, customerId: row.customer_id, customerName: row.customer_name, phone: row.phone,
    deviceType: row.device_type, deviceModel: row.device_model, symptoms: parseSymptoms(row.symptoms),
    note: row.note, status: row.status, priority: row.priority, estimatedMin: row.estimated_min,
    estimatedMax: row.estimated_max, createdAt: row.created_at, updatedAt: row.updated_at,
    history: history.results,
  };
}

const selectJob = `SELECT j.*, c.name AS customer_name, c.phone AS phone
  FROM repair_jobs j JOIN customers c ON c.id = j.customer_id`;

export async function createRepair(input: {
  name: string; phone: string; email?: string; deviceType: string; deviceModel: string; symptoms: string[]; note?: string;
}): Promise<RepairJob> {
  const now = Math.floor(Date.now() / 1000);
  const customerId = crypto.randomUUID();
  const id = repairCode();
  await db().batch([
    db().prepare("INSERT INTO customers (id, name, phone, email, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(customerId, input.name, input.phone, input.email || null, now),
    db().prepare("INSERT INTO repair_jobs (id, customer_id, device_type, device_model, symptoms, note, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'received', 'normal', ?, ?)")
      .bind(id, customerId, input.deviceType, input.deviceModel, JSON.stringify(input.symptoms), input.note || null, now, now),
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
  return getRepair(id);
}
