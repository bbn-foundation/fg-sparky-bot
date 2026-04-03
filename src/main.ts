/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import Commands from "#cmds";
import { UsersDB } from "#db";
import { NumberdexBaker, setupCronJobs } from "#numberdex/cron.ts";
import { Numberhumans, Numbers, Responses } from "#stores";
import { Logger } from "#utils/logger.ts";
import { Command } from "commander";
import { Client } from "discord.js";
import packageJson from "../package.json" with { type: "json" };
import { initClient } from "./index.ts";

const program = new Command()
  .version(packageJson.version)
  .description("FG sparky bot as a cli")
  .option(
    "-t, --token <token>",
    "The discord bot token to login with (env variable: DISCORD_TOKEN)",
  );

program.parse(process.argv);

const { token = process.env.DISCORD_TOKEN } = program.opts<{
  token?: string;
}>();

if (!token) {
  Logger.error(
    `The bot token must be passed in via the --token / -t flag or the DISCORD_TOKEN environment variable.`,
  );
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

const shutdownHandler = async () => {
  process.off("SIGINT", shutdownHandler);
  process.off("SIGTERM", shutdownHandler);
  Logger.notice("shutting down bot");
  await NumberdexBaker.saveState();
  await UsersDB.destroy();
  await Numbers.save();
  await Numberhumans.save();
  await Responses.save();
  process.exit(0);
};

try {
  Logger.notice("Loading entries from numbers.json");
  await Numbers.load();
  Logger.notice("Loading entries from numberdex-data.json");
  await Numberhumans.load();
  Logger.notice("Loading entries from responses.json");
  await Responses.load();

  Logger.notice("Initializing database");
  await UsersDB.initialize();

  await initClient(client, token, Commands);
  await setupCronJobs(client, Numberhumans, NumberdexBaker);
  Logger.notice(`Starting cron jobs...`);
  NumberdexBaker.bakeAll();
  process.on("SIGINT", shutdownHandler)
    .on("SIGTERM", shutdownHandler);
} catch (error) {
  if (!Error.isError(error)) throw error;
  Logger.error(`Failed to initialize bot client: ${error.message}`);
  Logger.error(error.stack ?? "No stack trace available");
  process.exit(1);
}
