import { loadCommands } from "#cmd-loader";
import { Logger } from "#utils/logger";
import { type ChatInputCommandInteraction, type Client, MessageFlags } from "discord.js";

export default async function reloadCmdCommand(
  client: Client,
  interaction: ChatInputCommandInteraction<"cached" | "raw">,
): Promise<void> {
  const commandName = interaction.options.getString("cmd-name", true);
  const command = Commands.find(cmd => cmd.name === commandName);
  if (!command) {
    await interaction.reply({
      content: `sorry i don't have a /${commandName} command`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  Logger.notice(`trying to reload commands...`);

  if ((await loadCommands(client, globalThis.commandFolder)).length > 0) {
    await interaction.reply("reloaded commands");
  } else {
    await interaction.reply("sorry i couldn't reload the commnds");
  }
}
