import { Command } from "commander";
import { Client } from "discord.js";
import { initClient, initDB } from ".";
import { AppDataSource } from "./db";
import { Logger } from "./utils/logger";

const program = new Command()
  .version("0.6.2")
  .description("FG sparky bot as a cli")
  .requiredOption("-t, --token <token>", "The discord bot token to login with")
  .option("-l, --loglevel [loglevel]", "Logging level as a number");

program.parse(process.argv);

const { token, loglevel } = program.opts<{
  token: string;
  loglevel?: number;
}>();

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
