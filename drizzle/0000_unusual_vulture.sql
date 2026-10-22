CREATE TABLE `contents` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`content_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `content_id`)
);
--> statement-breakpoint
CREATE TABLE `journals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content_id` text NOT NULL,
	`feeling` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`label` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`member_until` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`user_id` text NOT NULL,
	`content_id` text NOT NULL,
	`minutes` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `content_id`)
);
--> statement-breakpoint
CREATE TABLE `unlocks` (
	`user_id` text NOT NULL,
	`content_id` text NOT NULL,
	`id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `content_id`)
);
