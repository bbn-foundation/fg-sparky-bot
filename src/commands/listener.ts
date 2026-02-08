/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Logger } from "#utils/logger";
import type { Command } from "#utils/types.ts";
import type { AutocompleteInteraction } from "discord.js";
import { type Client, type CommandInteraction, MessageFlags } from "discord.js";
import { GuessCooldownCollection } from "./cooldowns/guesses.ts";
import { CooldownCollection } from "./cooldowns/normal.ts";
import { loadCommands } from "./loader.ts";

const commandCooldowns = new CooldownCollection();
export const guessCooldowns: GuessCooldownCollection = new GuessCooldownCollection();

export async function handleSlashCommand(
  client: Client,
  interaction: CommandInteraction,
  commands: readonly Command[],
): Promise<void> {
  if (!interaction.inGuild()) {
    Logger.warning(`user ${interaction.user.displayName} tried running command /${interaction.commandName} outside of a discord server`,);
    await interaction.reply(
      "sorry, fg sparky currently doesn't support guesses outside of servers",
    );
    return;
  }
  Logger.debug(`Finding command ${interaction.commandName}`);
  const slashCommand = commands.find((c) => c.name === interaction.commandName);
  if (!slashCommand) {
    Logger.error(`User ${interaction.user.username} (${interaction.user.displayName})
      attempted to invoke a nonexistent command (/${interaction.commandName})`);
    await interaction.reply({ content: "An error has occurred" });
    return;
  }

  Logger.info(`Making sure the command ${interaction.commandName} isn't on cooldown...`);
  if (slashCommand.name === "guess" && guessCooldowns.check(slashCommand, interaction.channelId)) {
    await interaction.reply({
      content:
        `Chill sis, the previous guess hasn't finished yet! Please answer correctly or wait for it to time out first.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (slashCommand.name !== "guess") {
    for (const timestamp of commandCooldowns.check(slashCommand, interaction.user.id)) {
      // oxlint-disable-next-line no-await-in-loop: not a loop (using iterators to unwrap the option)
      await interaction.reply({
        content: `Chill man you can't run /${slashCommand.name}, you can try again <t:${timestamp.toString()}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  Logger.info(`Running command ${interaction.commandName}`);
  await slashCommand.run(client, interaction);
}

export async function handleAutocomplete(
  client: Client,
  interaction: AutocompleteInteraction,
  commands: readonly Command[],
): Promise<void> {
  if (!interaction.inGuild()) {
    Logger.warning(`user ${interaction.user.displayName} tried running command /${interaction.commandName} outside of a discord server`,);
    return;
  }
  Logger.debug(`Finding command ${interaction.commandName}`);
  const slashCommand = commands.find((c) => c.name === interaction.commandName);
  if (!slashCommand) {
    Logger.error(`User ${interaction.user.username} (${interaction.user.displayName})
      attempted to invoke a nonexistent command (/${interaction.commandName})`);
    return;
  }

  Logger.info(`Autocompleting options for command ${interaction.commandName}`);
  await slashCommand.autocomplete?.(client, interaction);
}

export function registerCommands(client: Client): void {
  client.once("clientReady", async () => {
    if (!client.user || !client.application) {
      Logger.warning("Client is not loaded, refusing to register bot commands");
      return;
    }

    globalThis.Commands = await loadCommands(client, commandFolder);

    Logger.info(`${client.user.username} is online`);
  });
}
