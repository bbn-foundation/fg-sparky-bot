/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { DataSource } from "typeorm";
import { NumberhumanData } from "./numberhuman.ts";
import { UserProfile } from "./user-profile.ts";
import libSQL from "libsql";

export const UsersDB: DataSource = new DataSource({
  type: "better-sqlite3",
  database: "sparky-bot-db.sqlite",
  synchronize: true,
  logging: true,
  entities: [UserProfile, NumberhumanData],
  migrations: [],
  subscribers: [],
  enableWAL: true,
  driver: libSQL,
});
