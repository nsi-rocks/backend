CREATE TABLE `submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`student_name` text NOT NULL,
	`activity_id` text NOT NULL,
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`metadata` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_public_id_unique` ON `submissions` (`public_id`);