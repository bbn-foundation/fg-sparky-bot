/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { relations } from "./schema.ts";

const sqlite = new Database(process.env.DB_FILE_NAME);
export const UsersDB = drizzle({
  client: sqlite,
  relations,
});
