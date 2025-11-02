import type { Client, CommandInteraction } from "discord.js";
import type { Command } from "./types";
import { Logger } from "../utils/logger";

export async function handleSlashCommand(
  client: Client,
  interaction: CommandInteraction,
  commands: readonly Command[],
): Promise<void> {
  Logger.debug(`Finding command ${interaction.commandName}`);
  const slashCommand = commands.find(c => c.name === interaction.commandName);
  if (!slashCommand) {
    Logger.error(`User ${interaction.user.username} (${interaction.user.displayName})
      attempted to invoke a nonexistent command (/${interaction.commandName})`);
    await interaction.followUp({ content: "An error has occurred" });
    return;
  }

  await interaction.deferReply();

  Logger.info(`Running command ${interaction.commandName}`);
  await slashCommand.run(client, interaction);
};

export function registerCommands(client: Client, commands: readonly Command[]): void {
  client.once("clientReady", async () => {
    if (!client.user || !client.application) {
      Logger.warn("Client is not loaded, refusing to register bot commands");
      return;
    }

    Logger.info(`Registering ${commands.length.toString()} commands`);
    await client.application.commands.set(commands);

    Logger.info(`${client.user.username} is online`);
  });
};
