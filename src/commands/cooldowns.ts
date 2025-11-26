/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Collection, type CommandInteraction, MessageFlags } from "discord.js";
import { Logger } from "../utils/logger";
import type { Command } from "./types";

const cooldowns = new Collection<string, Collection<string, number>>();

/**
 * This is a map of channels that shows whetever the guess is still ongoing
 * or not. Uses to stop other guesses in the same channel until the previous
 * one is finished.
 */
export const guessCooldowns: Collection<string, boolean> = new Collection<string, boolean>();

export async function enforceGuessingCooldown(command: Command, interaction: CommandInteraction): Promise<boolean> {
  if (!guessCooldowns.has(interaction.channelId) || !guessCooldowns.get(interaction.channelId)) {
    Logger.debug(`Channel ${interaction.channelId} cooldown doesn't exist, creating and applying cooldown...`);
    guessCooldowns.set(interaction.channelId, true);
    return false;
  }

  Logger.warn(`Uaer ${interaction.user.displayName} in channel ${interaction.channelId} tried to run /guess but the previous guess hasn't finished yet!`);
  await interaction.reply({
    content: `Chill sis, the previous guess hasn't finished yet! Please answer correctly or wait for it to time out first.`,
    flags: MessageFlags.Ephemeral,
  });
  return true;
}

export async function enforceCooldown(command: Command, interaction: CommandInteraction): Promise<boolean> {
  if (command.name === "guess") return await enforceGuessingCooldown(command, interaction);
  if (!cooldowns.has(command.name)) {
    Logger.debug(`Command ${command.name} doesn't exist in cooldown collect, creating...`);
    cooldowns.set(command.name, new Collection());
  }

  Logger.debug(`Calculating cooldown time...`);

  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const timestamps = cooldowns.get(command.name)!;
  const defaultCooldownDuration = 0;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

  if (timestamps.has(interaction.user.id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
    if (now < expirationTime) {
      Logger.warn(`User tried to run command ${command.name} but they're on cooldown for another ${((expirationTime - now) / 1000).toFixed(3)} seconds`);
      const expiredTimestamp = Math.round(expirationTime / 1_000);
      await interaction.reply({
        content: `Chill man you can't run /${command.name}, you can try again <t:${expiredTimestamp.toString()}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
      return true;
    }
  }

  if (cooldownAmount !== 0) {
    Logger.info(`Applying cooldown to command ${command.name} for ${(cooldownAmount / 1000).toFixed(2)} seconds`);
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  }
  return false;
}
