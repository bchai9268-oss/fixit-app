CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`repair_id` text NOT NULL,
	`amount` integer NOT NULL,
	`method` text NOT NULL,
	`slip_key` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`reviewed_at` integer,
	FOREIGN KEY (`repair_id`) REFERENCES `repair_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_slip_key_unique` ON `payments` (`slip_key`);
--> statement-breakpoint
CREATE INDEX `idx_payments_repair_id_created_at` ON `payments` (`repair_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_payments_status_created_at` ON `payments` (`status`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;

