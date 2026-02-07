import { Logger } from "#utils/logger";
import type { Command } from "#utils/types.ts";
import { type ChatInputCommandInteraction, type Client, MessageFlags } from "discord.js";

let reloadCount = 0;

export default async function reloadCmdCommand(
  _: Client,
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

  Logger.notice(`trying to reload command ${commandName}...`);

  try {
    // I sure hope the command's name matches what it's called
    //
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const command = (await import(`${globalThis.commandFolder}/${commandName}?count=${reloadCount++}`))
      // oxlint-disable-next-line typescript/no-unsafe-member-access
      .default as Command;
    const existingCommand = await interaction.client.application.commands.fetch();
    await interaction.client.application.commands.edit(
      existingCommand.find(value => value.name === commandName)!,
      command,
    );

    Logger.notice(`successfully reloaded command ${commandName}!`);
    await interaction.reply(`successfully reloaded /${commandName}`);
  } catch (err) {
    if (!Error.isError(err)) throw err;
    Logger.error(`failed to reload commnd ${commandName}! error was: ${err.message}`);
    Logger.error("Stack trace: %s", err.stack ?? "there was none");
    await interaction.reply({
      content: `failed to reload command ${commandName}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
