/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Client } from "discord.js";
import type { DataSource } from "typeorm";
import { Logger } from "../scripts/logger";
import { Commands } from "./commands/commands";
import { registerCommands } from "./commands/listener";
import { registerHandlers } from "./handlers";

export async function initClient(client: Client, token: string): Promise<void> {
  registerHandlers(client);
  registerCommands(client, Commands);

  Logger.info("Logging in");
  await client.login(token);
}

export async function initDB(database: DataSource): Promise<void> {
  Logger.notice("Initializing database");

  try {
    await database.initialize();
  } catch (error) {
    if (!Error.isError(error)) throw error;
    Logger.error(`Failed to initialize database: ${error.message}`);
    Logger.error(error.stack ?? "No stack trace available");
    throw error;
  }
}
