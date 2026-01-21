import { Logger } from "#utils/logger.ts";
import type { Command } from "#utils/types.ts";
import { Collection } from "discord.js";

export class GuessCooldownCollection extends Collection<string, boolean> {
  /**
   * Checks whetever a player guess is already running for that channel.
   * @returns A boolean that says whetever it's already running.
   */
  check(_c: Command, channelId: string): boolean {
    if (!this.has(channelId) || !this.get(channelId)) {
      Logger.debug(
        `Channel ${channelId} cooldown doesn't exist, creating and applying cooldown...`,
      );
      this.set(channelId, true);
      return false;
    }

    Logger.warn(
      `A player in channel ${channelId} tried to run /guess but the previous guess hasn't finished yet!`,
    );
    return true;
  }
}
