/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Logger } from "#utils/logger.ts";
import type { Client } from "discord.js";
import { registerCommands } from "./commands/listener.ts";
import { registerHandlers } from "./handlers.ts";

export async function initClient(client: Client, token: string): Promise<void> {
  registerHandlers(client);
  registerCommands(client);

  Logger.info("Logging in");
  await client.login(token);
}
