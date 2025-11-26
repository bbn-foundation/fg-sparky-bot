/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Command } from "commander";
import { Client } from "discord.js";
import { initClient, initDB } from ".";
import { AppDataSource } from "./db";
import { Logger } from "./utils/logger";

const program = new Command()
  .version("0.6.2")
  .description("FG sparky bot as a cli")
  .option("-t, --token <token>", "The discord bot token to login with (env variable: DISCORD_TOKEN)")
  .option("-l, --loglevel [loglevel]", "Logging level as a number (env variable: LOG_LEVEL)");

program.parse(process.argv);

const { token = process.env.DISCORD_TOKEN, loglevel = process.env.LOG_LEVEL } = program.opts<{
  token?: string;
  loglevel?: number;
}>();

if (!token) {
  Logger.error(`The bot token must be passed in via the --token / -t flag or the DISCORD_TOKEN environment variable.`);
  process.exit(1);
}

const client: Client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages", "MessageContent"],
});

try {
  Logger.loglevel = loglevel ?? 0;
  await initDB(AppDataSource);
  await initClient(client, token);
} catch (error) {
  if (!Error.isError(error)) throw error;
  Logger.error(`Failed to initalize bot client: ${error.message}`);
  Logger.error(error.stack ?? "No stack trace available");
  process.exit(1);
}
