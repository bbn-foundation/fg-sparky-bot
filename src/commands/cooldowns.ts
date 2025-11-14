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
import { Collection, type CommandInteraction, MessageFlags } from "discord.js";
import { Logger } from "../utils/logger";
import type { Command } from "./types";

const cooldowns = new Collection<string, Collection<string, number>>();

export async function enforceCooldown(command: Command, interaction: CommandInteraction): Promise<boolean> {
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
