/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Client } from "discord.js";
import { Commands } from "./commands/commands";
import { registerCommands } from "./commands/listener";
import { registerHandlers } from "./handlers";
import { Logger } from "./utils/logger";

export async function initClient(client: Client, token: string): Promise<void> {
  registerHandlers(client);
  registerCommands(client, Commands);

  Logger.info("Logging in");
  await client.login(token);
}
