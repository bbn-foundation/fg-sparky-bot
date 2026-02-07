import { loadCommands } from "#cmd-loader";
import { Logger } from "#utils/logger";
import type { ChatInputCommandInteraction, Client } from "discord.js";

export default async function reloadCmdCommand(
  client: Client,
  interaction: ChatInputCommandInteraction<"cached" | "raw">,
): Promise<void> {
  Logger.notice(`trying to reload commands...`);

  if ((await loadCommands(client, globalThis.commandFolder)).length > 0) {
    await interaction.reply("reloaded commands");
  } else {
    await interaction.reply("sorry i couldn't reload the commnds");
  }
}
