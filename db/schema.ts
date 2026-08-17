import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  passwordIterations: integer("password_iterations").notNull().default(100000),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: integer("locked_until"),
  createdAt: integer("created_at").notNull(),
});

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idx_admin_sessions_user_id").on(table.userId), index("idx_admin_sessions_expires_at").on(table.expiresAt)],
);

export const customers = sqliteTable(
  "customers",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    lineUserId: text("line_user_id"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idx_customers_phone").on(table.phone), index("idx_customers_line_user_id").on(table.lineUserId)],
);

export const repairJobs = sqliteTable(
  "repair_jobs",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
    deviceType: text("device_type").notNull(),
    deviceModel: text("device_model").notNull(),
    symptoms: text("symptoms").notNull(),
    note: text("note"),
    status: text("status").notNull().default("received"),
    priority: text("priority").notNull().default("normal"),
    estimatedMin: integer("estimated_min"),
    estimatedMax: integer("estimated_max"),
    finalPrice: integer("final_price"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    adminNote: text("admin_note"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("idx_repair_jobs_customer_id").on(table.customerId),
    index("idx_repair_jobs_status_updated_at").on(table.status, table.updatedAt),
    index("idx_repair_jobs_payment_status").on(table.paymentStatus),
  ],
);

export const repairStatusHistory = sqliteTable(
  "repair_status_history",
  {
    id: text("id").primaryKey(),
    repairId: text("repair_id").notNull().references(() => repairJobs.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    note: text("note"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idx_repair_status_history_repair_id_created_at").on(table.repairId, table.createdAt)],
);

export const notificationLogs = sqliteTable(
  "notification_logs",
  {
    id: text("id").primaryKey(),
    repairId: text("repair_id").notNull().references(() => repairJobs.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(),
    status: text("status").notNull(),
    sentAt: integer("sent_at").notNull(),
  },
  (table) => [index("idx_notification_logs_repair_id").on(table.repairId)],
);

export const payments = sqliteTable(
  "payments",
  {
    id: text("id").primaryKey(),
    repairId: text("repair_id").notNull().references(() => repairJobs.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    method: text("method").notNull(),
    slipKey: text("slip_key").notNull().unique(),
    originalName: text("original_name").notNull(),
    contentType: text("content_type").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: integer("created_at").notNull(),
    reviewedAt: integer("reviewed_at"),
  },
  (table) => [index("idx_payments_repair_id_created_at").on(table.repairId, table.createdAt), index("idx_payments_status_created_at").on(table.status, table.createdAt)],
);

export const repairMedia = sqliteTable(
  "repair_media",
  {
    id: text("id").primaryKey(),
    repairId: text("repair_id").notNull().references(() => repairJobs.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    objectKey: text("object_key").notNull().unique(),
    originalName: text("original_name").notNull(),
    contentType: text("content_type").notNull(),
    caption: text("caption"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idx_repair_media_repair_id_created_at").on(table.repairId, table.createdAt)],
);

export const repairParts = sqliteTable(
  "repair_parts",
  {
    id: text("id").primaryKey(),
    repairId: text("repair_id").notNull().references(() => repairJobs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: integer("unit_price").notNull().default(0),
    warrantyDays: integer("warranty_days").notNull().default(90),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idx_repair_parts_repair_id").on(table.repairId)],
);

export const repairQuotes = sqliteTable(
  "repair_quotes",
  {
    id: text("id").primaryKey(),
    repairId: text("repair_id").notNull().unique().references(() => repairJobs.id, { onDelete: "cascade" }),
    laborAmount: integer("labor_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    note: text("note"),
    status: text("status").notNull().default("pending"),
    respondedAt: integer("responded_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("idx_repair_quotes_status_updated_at").on(table.status, table.updatedAt)],
);

export const warranties = sqliteTable(
  "warranties",
  {
    id: text("id").primaryKey(),
    repairId: text("repair_id").notNull().unique().references(() => repairJobs.id, { onDelete: "cascade" }),
    warrantyNumber: text("warranty_number").notNull().unique(),
    startsAt: integer("starts_at").notNull(),
    endsAt: integer("ends_at").notNull(),
    terms: text("terms").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idx_warranties_ends_at").on(table.endsAt)],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    repairId: text("repair_id").notNull().unique().references(() => repairJobs.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    status: text("status").notNull().default("pending"),
    createdAt: integer("created_at").notNull(),
    reviewedAt: integer("reviewed_at"),
  },
  (table) => [index("idx_reviews_status_created_at").on(table.status, table.createdAt)],
);
