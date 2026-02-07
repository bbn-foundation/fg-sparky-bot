/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { UsersDB } from "#db";
import { NumberdexBaker, setupCronJobs } from "#numberdex/cron.ts";
import { Numberhumans, Numbers, Responses } from "#stores";
import { Logger } from "#utils/logger.ts";
import type { Command as ApplicationCommand } from "#utils/types.ts";
import { Command } from "commander";
import { Client } from "discord.js";
import { readdir } from "node:fs/promises";
import packageJson from "../package.json" with { type: "json" };
import { initClient } from "./index.ts";

const program = new Command()
  .version(packageJson.version)
  .description("FG sparky bot as a cli")
  .option(
    "-t, --token <token>",
    "The discord bot token to login with (env variable: DISCORD_TOKEN)",
  )
  .option(
    "-c, --commands-folder <directory>",
    "Folder that has all of the bot's commands (default: $CWD/data/commands)",
  );

program.parse(process.argv);

const { token = process.env.DISCORD_TOKEN, commandsFolder = `${process.cwd()}/data/commands` } = program.opts<{
  token?: string;
  commandsFolder?: string;
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
    var Commands: readonly ApplicationCommand[];
  }
}

Logger.notice(`Searching for commands...`);
const commandFiles = await readdir(
  Bun.fileURLToPath(import.meta.resolve(commandsFolder, import.meta.url)),
  {
    withFileTypes: true,
  },
);
const commands: readonly ApplicationCommand[] = await Promise.all(
  commandFiles.filter(entry => entry.isFile())
    .map(entry => entry.name)
    // oxlint-disable-next-line typescript/no-unsafe-return, no-unsafe-member-access
    .map(async (src) => (await import(`${commandsFolder}/${src}`)).default),
);

globalThis.client = client;
globalThis.Commands = commands;

try {
  Logger.notice("Loading entries from numbers.json");
  await Numbers.load();
  Logger.notice("Loading entries from numberdex-data.json");
  await Numberhumans.load();
  Logger.notice("Loading entries from responses.json");
  await Responses.load();

  Logger.notice("Initializing database");
  await UsersDB.initialize();

  await initClient(client, token, commands);
  await setupCronJobs(client, Numberhumans, NumberdexBaker);
  process.on("beforeExit", async () => {
    await NumberdexBaker.saveState();
  });
} catch (error) {
  if (!Error.isError(error)) throw error;
  Logger.error(`Failed to initialize bot client: ${error.message}`);
  Logger.error(error.stack ?? "No stack trace available");
  process.exit(1);
}
