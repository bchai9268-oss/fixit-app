ALTER TABLE `repair_jobs` ADD `final_price` integer;
--> statement-breakpoint
ALTER TABLE `repair_jobs` ADD `payment_status` text DEFAULT 'unpaid' NOT NULL;
--> statement-breakpoint
ALTER TABLE `repair_jobs` ADD `admin_note` text;
--> statement-breakpoint
CREATE INDEX `idx_repair_jobs_payment_status` ON `repair_jobs` (`payment_status`);
--> statement-breakpoint
PRAGMA optimize;
