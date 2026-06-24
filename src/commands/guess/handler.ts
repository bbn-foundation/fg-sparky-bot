/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { getUser } from "#db";
import { StreakCollection } from "#fg-sparky/streaks.ts";
import { GuessCooldowns } from "#stores";
import { createGuessHandler } from "#utils/guess-handler.ts";
import { Logger } from "#utils/logger.ts";
import type { StoredNumberInfo } from "#utils/types.ts";
import {
  type ChatInputCommandInteraction,
  type Client,
  Collection,
  type Message,
} from "discord.js";
import handleSpecialGuess from "./special-handler.ts";
import { updateUserStats } from "./update-stats.ts";

const streakCollectionCollection = new Collection<string, StreakCollection>();
const streakTracker = new Collection<string, string>();
const handlePlayerGuess = createGuessHandler("sha512");

export function handleResponse(
  interaction: ChatInputCommandInteraction<"raw" | "cached">,
  number: StoredNumberInfo,
): void {
  const streakCollection = (() => {
    if (streakCollectionCollection.get(interaction.channelId)) {
      return streakCollectionCollection.get(interaction.channelId)!;
    }
    streakCollectionCollection.set(interaction.channelId, new StreakCollection());
    return streakCollectionCollection.get(interaction.channelId)!;
  })();

  // fg sparky can only be run in text channels
  const collector = interaction.channel!.createMessageCollector({
    time: number.difficulty === "legendary" ? 60000 : 40000,
  });

  collector.on("collect", async (message: Message) => {
    if (message.author.bot || !message.inGuild()) return;

    const user = await getUser(message.author.id, message.guildId);

    if (await handleSpecialGuess(message, number, user, "pre-parse")) {
      return;
    }
    if (handlePlayerGuess(message.content, number)) {
      collector.stop("success");
      GuessCooldowns.set(interaction.channelId, false);

      const previousPerson = streakTracker.get(interaction.channelId);
      if (previousPerson !== `${message.author.id}.${message.guildId!}`) {
        streakCollection.resetStreak(message.author.id, message.guildId!);
        streakTracker.set(interaction.channelId, `${message.author.id}.${message.guildId!}`);
      }

      await updateUserStats(message, user, streakCollection, number, message.content);
    }
  });

  collector.once("end", async (_, reason) => {
    if (reason === "success") return;
    Logger.info("user failed to guess in time");
    GuessCooldowns.set(interaction.channelId, false);
    await streakCollection.clear();

    const content = `no one guessed in time${number.number ? `, the correct answer was ${number.number}.` : "."}`;
    await interaction.followUp({
      content,
      allowedMentions: { repliedUser: false },
    });
  });
}
