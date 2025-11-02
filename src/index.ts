import { Client, type Interaction } from "discord.js";
import { handleSlashCommand, registerCommands } from "./commands/listener.ts";
import { Commands } from "./commands/commands.ts";
import { Logger } from "./utils/logger.ts";
import config from "../.config.json";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("clientReady", (client: Client<true>) => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" });
  const formattedDate = formatter.format(date);
  Logger.notice(`Bot running as ${client.user.username} (started at ${formattedDate})`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isCommand()) {
    await handleSlashCommand(client, interaction, Commands);
  }
});

registerCommands(client, Commands);

Logger.info("Logging in");
await client.login(config.DISCORD_TOKEN);
