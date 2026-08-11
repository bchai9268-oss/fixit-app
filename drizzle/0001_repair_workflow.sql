CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_customers_phone` ON `customers` (`phone`);
--> statement-breakpoint
CREATE TABLE `repair_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`device_type` text NOT NULL,
	`device_model` text NOT NULL,
	`symptoms` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'received' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`estimated_min` integer,
	`estimated_max` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_repair_jobs_customer_id` ON `repair_jobs` (`customer_id`);
--> statement-breakpoint
CREATE INDEX `idx_repair_jobs_status_updated_at` ON `repair_jobs` (`status`,`updated_at`);
--> statement-breakpoint
CREATE TABLE `repair_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`repair_id` text NOT NULL,
	`status` text NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`repair_id`) REFERENCES `repair_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_repair_status_history_repair_id_created_at` ON `repair_status_history` (`repair_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `notification_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`repair_id` text NOT NULL,
	`channel` text NOT NULL,
	`status` text NOT NULL,
	`sent_at` integer NOT NULL,
	FOREIGN KEY (`repair_id`) REFERENCES `repair_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notification_logs_repair_id` ON `notification_logs` (`repair_id`);
--> statement-breakpoint
PRAGMA optimize;
