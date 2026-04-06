CREATE TABLE `numberhuman` (
	`catchId` integer PRIMARY KEY AUTOINCREMENT,
	`id` text,
	`ability` text,
	`bonusHP` real DEFAULT 1,
	`bonusAtk` real DEFAULT 1,
	`level` integer DEFAULT 0,
	`evolution` text,
	`caughtById` text,
	`caughtByGuildId` text,
	CONSTRAINT `fk_numberhuman_caughtById_user_profiles_id_fk` FOREIGN KEY (`caughtById`) REFERENCES `user_profiles`(`id`),
	CONSTRAINT `fk_numberhuman_caughtByGuildId_user_profiles_guildId_fk` FOREIGN KEY (`caughtByGuildId`) REFERENCES `user_profiles`(`guildId`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text,
	`guildId` text,
	`tokens` integer DEFAULT 0,
	`guessedEntries` text DEFAULT '[]',
	`uniqueGuessed` text DEFAULT '[]',
	`numberhumansGuessed` text DEFAULT '[]',
	`numberhumansGuessedUnique` text DEFAULT '[]',
	`bestStreak` integer DEFAULT 0,
	CONSTRAINT `user_profiles_pk` PRIMARY KEY(`id`, `guildId`)
);
