/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
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
