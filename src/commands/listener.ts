/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Client, CommandInteraction } from "discord.js";
import { Logger } from "../utils/logger";
import { enforceCooldown } from "./cooldowns";
import type { Command } from "./types";

export async function handleSlashCommand(
  client: Client,
  interaction: CommandInteraction,
  commands: readonly Command[],
): Promise<void> {
  if (!interaction.inGuild()) {
    Logger.warn(`user ${interaction.user.displayName} tried running command /${interaction.commandName} outside of a discord server`);
    await interaction.reply("sorry, fg sparky currently doesn't support guesses outside of servers");
    return;
  }
  Logger.debug(`Finding command ${interaction.commandName}`);
  const slashCommand = commands.find(c => c.name === interaction.commandName);
  if (!slashCommand) {
    Logger.error(`User ${interaction.user.username} (${interaction.user.displayName})
      attempted to invoke a nonexistent command (/${interaction.commandName})`);
    await interaction.reply({ content: "An error has occurred" });
    return;
  }

  Logger.info(`Making sure the command ${interaction.commandName} isn't on cooldown...`);
  if (await enforceCooldown(slashCommand, interaction)) return;
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
