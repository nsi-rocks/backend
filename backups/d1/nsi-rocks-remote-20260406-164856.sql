PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0000_aberrant_gamora.sql','2026-04-05 09:38:40');
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer
);
INSERT INTO "users" ("id","public_id","name","password","created_at") VALUES(1,'test','test','test',NULL);
INSERT INTO "users" ("id","public_id","name","password","created_at") VALUES(2,'toto','toto','toto',NULL);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('users',2);
CREATE UNIQUE INDEX `users_public_id_unique` ON `users` (`public_id`);
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);
