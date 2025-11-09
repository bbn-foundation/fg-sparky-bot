/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import type { Client, CommandInteraction } from "discord.js";
import { Logger } from "../utils/logger";
import type { Command } from "./types";

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
