ALTER TABLE `customers` ADD `line_user_id` text;
--> statement-breakpoint
CREATE INDEX `idx_customers_line_user_id` ON `customers` (`line_user_id`);
--> statement-breakpoint
PRAGMA optimize;
