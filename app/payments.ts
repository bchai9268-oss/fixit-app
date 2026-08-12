import { env } from "cloudflare:workers";

export type PaymentStatus = "pending" | "paid" | "rejected";

export type PaymentRecord = {
  id: string;
  repairId: string;
  amount: number;
  method: "qr" | "bank";
  slipKey: string;
  originalName: string;
  contentType: string;
  status: PaymentStatus;
  createdAt: number;
  reviewedAt: number | null;
};

type PaymentRow = {
  id: string; repair_id: string; amount: number; method: "qr" | "bank"; slip_key: string;
  original_name: string; content_type: string; status: PaymentStatus; created_at: number; reviewed_at: number | null;
};

function db() {
  if (!env.DB) throw new Error("Payment database is unavailable");
  return env.DB;
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return { id: row.id, repairId: row.repair_id, amount: row.amount, method: row.method, slipKey: row.slip_key, originalName: row.original_name, contentType: row.content_type, status: row.status, createdAt: row.created_at, reviewedAt: row.reviewed_at };
}

export async function createPayment(input: { repairId: string; amount: number; method: "qr" | "bank"; slipKey: string; originalName: string; contentType: string }) {
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await db().batch([
    db().prepare("INSERT INTO payments (id, repair_id, amount, method, slip_key, original_name, content_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)")
      .bind(id, input.repairId, input.amount, input.method, input.slipKey, input.originalName, input.contentType, now),
    db().prepare("UPDATE repair_jobs SET payment_status = 'pending', updated_at = ? WHERE id = ?").bind(now, input.repairId),
  ]);
  return getPayment(id);
}

export async function getPayment(id: string): Promise<PaymentRecord | null> {
  const row = await db().prepare("SELECT * FROM payments WHERE id = ? LIMIT 1").bind(id).first<PaymentRow>();
  return row ? mapPayment(row) : null;
}

export async function listPayments(): Promise<PaymentRecord[]> {
  const rows = await db().prepare("SELECT * FROM payments ORDER BY created_at DESC LIMIT 100").all<PaymentRow>();
  return rows.results.map(mapPayment);
}

export async function reviewPayment(id: string, status: "paid" | "rejected"): Promise<PaymentRecord | null> {
  const payment = await getPayment(id);
  if (!payment) return null;
  const now = Math.floor(Date.now() / 1000);
  await db().batch([
    db().prepare("UPDATE payments SET status = ?, reviewed_at = ? WHERE id = ?").bind(status, now, id),
    db().prepare("UPDATE repair_jobs SET payment_status = ?, updated_at = ? WHERE id = ?").bind(status === "paid" ? "paid" : "unpaid", now, payment.repairId),
  ]);
  return getPayment(id);
}
