/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { DataSource } from "typeorm";
import { UserProfile } from "./entities/user-profile.ts";

export const AppDataSource: DataSource = new DataSource({
  type: "sqlite",
  database: "sparky-bot-db.sqlite",
  synchronize: true,
  logging: true,
  entities: [UserProfile],
  migrations: [],
  subscribers: [],
});
