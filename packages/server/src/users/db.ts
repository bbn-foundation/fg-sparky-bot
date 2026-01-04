/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import sqliteDriver from "sqlite3";
import { DataSource } from "typeorm";
import { NumberhumanData } from "./numberhuman.ts";
import { UserProfile } from "./user-profile.ts";

export const UsersDB: DataSource = new DataSource({
  type: "sqlite",
  database: "sparky-bot-db.sqlite",
  synchronize: true,
  logging: true,
  entities: [UserProfile, NumberhumanData],
  migrations: [],
  subscribers: [],
  driver: sqliteDriver,
  enableWAL: true,
});
