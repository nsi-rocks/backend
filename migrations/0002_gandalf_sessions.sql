CREATE TABLE `gandalf_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`student_name` text NOT NULL,
	`activity_id` text NOT NULL,
	`current_level` integer NOT NULL,
	`status` text NOT NULL,
	`secrets` text NOT NULL,
	`attempt_counts` text NOT NULL,
	`history` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`completed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gandalf_sessions_public_id_unique` ON `gandalf_sessions` (`public_id`);