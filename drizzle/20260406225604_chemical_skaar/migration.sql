CREATE TABLE `numberhuman` (
	`catchId` integer PRIMARY KEY AUTOINCREMENT,
	`id` text,
	`ability` text,
	`bonusHP` real DEFAULT 1,
	`bonusAtk` real DEFAULT 1,
	`level` integer DEFAULT 0,
	`evolution` text
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY,
	`guildId` text,
	`tokens` integer DEFAULT 0,
	`guessedEntries` text DEFAULT '[]',
	`uniqueGuessed` text DEFAULT '[]',
	`numberhumansGuessed` text DEFAULT '[]',
	`numberhumansGuessedUnique` text DEFAULT '[]',
	`bestStreak` integer DEFAULT 0
);
