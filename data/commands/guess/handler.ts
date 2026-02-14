/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { StreakCollection } from "#fg-sparky/streaks.ts";
import { createGuessHandler } from "#utils/guess-handler.ts";
import { Logger } from "#utils/logger.ts";
import type { StoredNumberInfo } from "#utils/types.ts";
import {
  type ChatInputCommandInteraction,
  type Client,
  Collection,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import handleSpecialGuess from "./special-handler.ts";

const streakCollectionCollection = new Collection<string, StreakCollection>();
const streakTracker = new Collection<string, string>();
const handlePlayerGuess = createGuessHandler("sha512");

export function handleResponse(
  client: Client,
  interaction: ChatInputCommandInteraction,
  number: StoredNumberInfo,
): void {
  const streakCollection = (() => {
    if (streakCollectionCollection.get(interaction.channelId)) {
      return streakCollectionCollection.get(interaction.channelId)!;
    }
    streakCollectionCollection.set(interaction.channelId, new StreakCollection());
    return streakCollectionCollection.get(interaction.channelId)!;
  })();

  const handler = async (message: OmitPartialGroupDMChannel<Message>) => {
    if (message.channelId !== interaction.channelId || message.author.bot) return;

    if (await handleSpecialGuess(message, number, "pre-parse")) {
      return;
    }
    if (handlePlayerGuess(message.content, number)) {
      clearTimeout(timeout);
      client.off("messageCreate", handler);
      globalThis.guessCooldowns.set(interaction.channelId, false);

      const previousPerson = streakTracker.get(interaction.channelId);
      if (previousPerson !== `${message.author.id}.${message.guildId!}`) {
        streakCollection.resetStreak(message.author.id, message.guildId!);
        streakTracker.set(interaction.channelId, `${message.author.id}.${message.guildId!}`);
      }
    }
  };

  const timeout = setTimeout(
    async () => {
      Logger.info("user failed to guess in time");
      client.off("messageCreate", handler);
      globalThis.guessCooldowns.set(interaction.channelId, false);
      await streakCollection.clear();

      const content = `no one guessed in time${number.number ? `, the correct answer was ${number.number}.` : "."}`;
      await interaction.followUp({
        content,
        allowedMentions: { repliedUser: false },
      });
    },
    number.difficulty === "legendary" ? 60000 : 40000,
  );

  client.on("messageCreate", handler);
}
