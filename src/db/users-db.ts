/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Database } from "bun:sqlite";
import { defineRelations } from "drizzle-orm";
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite";
import { numberhumans } from "./numberhuman.ts";
import { userProfiles } from "./user-profile.ts";

const sqlite = new Database(process.env.DB_FILE_NAME);
export const UsersDB: SQLiteBunDatabase<Record<string, unknown>> = drizzle({ client: sqlite });

const relations = defineRelations({
  numberhumans,
  userProfiles,
}, r => ({
  userProfiles: {
    caught: r.many.numberhumans(),
  },
  numberhumans: {
    caughtBy: r.one.userProfiles({
      from: r.numberhumans.catchId,
      to: [r.userProfiles.id, r.userProfiles.guildId],
    }),
  },
}));
