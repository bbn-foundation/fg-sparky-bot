import { Collection, type CommandInteraction, MessageFlags } from "discord.js";
import { Logger } from "../utils/logger";
import type { ChatInputCommand, Command } from "./types";

const cooldowns = new Collection<string, Collection<string, number>>();

export async function enforceCooldown(command: Command | ChatInputCommand, interaction: CommandInteraction): Promise<boolean> {
  if (!cooldowns.has(command.name)) {
    Logger.debug(`Command ${command.name} doesn't exist in cooldown collect, creating...`);
    cooldowns.set(command.name, new Collection());
  }

  Logger.debug(`Calculating cooldown time...`);

  const now = Date.now();
  const timestamps = cooldowns.get(command.name)!;
  const defaultCooldownDuration = 0;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
    if (now < expirationTime) {
      Logger.warn(`User tried to run command ${command.name} but they're on cooldown for another ${(expirationTime - now).toFixed(3)} seconds`);
      const expiredTimestamp = Math.round(expirationTime / 1_000);
      await interaction.reply({
        content: `Chill man you can't run /${command.name}, you can try again <t:${expiredTimestamp}:R>.`,
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
