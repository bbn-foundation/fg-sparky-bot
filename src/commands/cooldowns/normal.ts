/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Logger } from "#utils/logger.ts";
import type { Command } from "#utils/types.ts";
import { Option } from "@sapphire/result";
import { Collection } from "discord.js";

export class CooldownCollection extends Collection<string, Collection<string, number>> {
  /**
   * Checks whetever the command is ratelimited for the specific user.
   * @returns An Option value that has the timestamp of when the command can be ran again.
   */
  check(command: Command, userId: string): Option<number> {
    if (!this.has(command.name)) {
      Logger.debug(`Command ${command.name} doesn't exist in cooldown collection, creating...`);
      this.set(command.name, new Collection());
    }

    Logger.debug(`Calculating cooldown time...`);

    const now = Date.now();
    const timestamps = this.get(command.name)!;
    const defaultCooldownDuration = 0;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(userId)) {
      const expirationTime = timestamps.get(userId)! + cooldownAmount;
      if (now < expirationTime) {
        Logger.warn(
          `User tried to run command ${command.name} but they're on cooldown for another ${
            ((expirationTime - now) / 1000).toFixed(3)
          } seconds`,
        );
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return Option.from(expiredTimestamp);
      }
    }

    if (cooldownAmount !== 0) {
      Logger.info(
        `Applying cooldown to command ${command.name} for ${(cooldownAmount / 1000).toFixed(2)} seconds`,
      );
      timestamps.set(userId, now);
      setTimeout(() => timestamps.delete(userId), cooldownAmount);
    }
    // oxlint-disable-next-line no-unsafe-type-assertion: only way to construct a None value
    return Option.none as Option<number>;
  }
}
