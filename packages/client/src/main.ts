/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { NumberdexBaker, setupCronJobs, UsersDB } from "@fg-sparky/server";
import { Logger } from "@fg-sparky/utils";
import { Command } from "commander";
import { Client } from "discord.js";
import { initClient } from "./index.ts";
import { Numberhumans, Numbers } from "./stores.ts";

const program = new Command()
  .version("0.14.2")
  .description("FG sparky bot as a cli")
  .option("-t, --token <token>", "The discord bot token to login with (env variable: DISCORD_TOKEN)")
  .option("-l, --loglevel [loglevel]", "Logging level as a number (env variable: LOG_LEVEL)");

program.parse(process.argv);

const { token = process.env.DISCORD_TOKEN, loglevel = Number(process.env.LOG_LEVEL ?? 0) } = program.opts<{
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

declare global {
  namespace globalThis {
    var client: Client;
  }
}

globalThis.client = client;

try {
  Logger.loglevel = loglevel;
  Logger.notice("Loading entries from numbers.json");
  await Numbers.load();
  Logger.notice("Loading entries from numberdex-data.json");
  Numberhumans.loadJSON((await Bun.file("numbers/numberdex-data.json").json()).numberhumans);

  Logger.notice("Initializing database");
  await UsersDB.initialize();
  await initClient(client, token);
  await setupCronJobs(client, Numberhumans, NumberdexBaker);
  process.on("beforeExit", async () => {
    await NumberdexBaker.saveState();
  });
} catch (error) {
  if (!Error.isError(error)) throw error;
  Logger.error(`Failed to initalize bot client: ${error.message}`);
  Logger.error(error.stack ?? "No stack trace available");
  process.exit(1);
}
