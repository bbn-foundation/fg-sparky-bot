/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userProfiles = sqliteTable("user_profiles", {
  id: text().primaryKey(),
  guildId: text().primaryKey(),
  tokens: int().default(0),
  guessedEntries: text({ mode: "json" }).$type<string[]>().default([]),
  uniqueGuessed: text({ mode: "json" }).$type<string[]>().default([]),
  numberhumansGuessed: text({ mode: "json" }).$type<string[]>().default([]),
  numberhumansGuessedUnique: text({ mode: "json" }).$type<string[]>().default([]),
  bestStreak: int().default(0),
});
