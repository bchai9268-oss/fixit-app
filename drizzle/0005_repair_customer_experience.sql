CREATE TABLE `repair_media` (
	`id` text PRIMARY KEY NOT NULL,
	`repair_id` text NOT NULL,
	`kind` text NOT NULL,
	`object_key` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`caption` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`repair_id`) REFERENCES `repair_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `repair_media_object_key_unique` ON `repair_media` (`object_key`);
--> statement-breakpoint
CREATE INDEX `idx_repair_media_repair_id_created_at` ON `repair_media` (`repair_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `repair_parts` (
	`id` text PRIMARY KEY NOT NULL,
	`repair_id` text NOT NULL,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` integer DEFAULT 0 NOT NULL,
	`warranty_days` integer DEFAULT 90 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`repair_id`) REFERENCES `repair_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_repair_parts_repair_id` ON `repair_parts` (`repair_id`);
--> statement-breakpoint
CREATE TABLE `repair_quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`repair_id` text NOT NULL,
	`labor_amount` integer DEFAULT 0 NOT NULL,
	`total_amount` integer NOT NULL,
	`note` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`responded_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`repair_id`) REFERENCES `repair_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `repair_quotes_repair_id_unique` ON `repair_quotes` (`repair_id`);
--> statement-breakpoint
CREATE INDEX `idx_repair_quotes_status_updated_at` ON `repair_quotes` (`status`,`updated_at`);
--> statement-breakpoint
CREATE TABLE `warranties` (
	`id` text PRIMARY KEY NOT NULL,
	`repair_id` text NOT NULL,
	`warranty_number` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`terms` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`repair_id`) REFERENCES `repair_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `warranties_repair_id_unique` ON `warranties` (`repair_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `warranties_warranty_number_unique` ON `warranties` (`warranty_number`);
--> statement-breakpoint
CREATE INDEX `idx_warranties_ends_at` ON `warranties` (`ends_at`);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`repair_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`reviewed_at` integer,
	FOREIGN KEY (`repair_id`) REFERENCES `repair_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_repair_id_unique` ON `reviews` (`repair_id`);
--> statement-breakpoint
CREATE INDEX `idx_reviews_status_created_at` ON `reviews` (`status`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
