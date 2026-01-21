/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { createUser, getUser } from "#db";
import { StreakCollection } from "#fg-sparky/streaks.ts";
import { joinStringArray } from "#utils/formatter.ts";
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
import { guessCooldowns } from "../listener.ts";
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
      guessCooldowns.set(interaction.channelId, false);

      const previousPerson = streakTracker.get(interaction.channelId);
      if (previousPerson !== `${message.author.id}.${message.guildId!}`) {
        streakCollection.resetStreak(message.author.id, message.guildId!);
        streakTracker.set(interaction.channelId, `${message.author.id}.${message.guildId!}`);
      }

      const gain = streakCollection.getTokenGain(
        message.author.id,
        message.guildId!,
        number.difficulty,
      );

      // @ts-expect-error: assertion fails for some reason even though the bot can only
      // be installed in a guild
      const user = await getUser(message.author.id, message.guildId);
      Logger.debug(
        `tried looking up user ${message.author.id} (found: ${user ? "true" : "false"})`,
      );

      const currentStreak = streakCollection.get(`${message.author.id}.${message.guildId!}`) ?? 0;

      if (user) {
        Logger.info(`user already exists, adding tokens`);
        // update the player stats first...
        user.tokens += gain;
        user.guessedEntries.push(number.uuid);
        if (!user.uniqueGuessed.includes(number.uuid)) user.uniqueGuessed.push(number.uuid);
        // then reply.
        if (await handleSpecialGuess(message, number, "pre-parse")) {
          return;
        }
        if (number.uuid === "dd35acbf-4c92-4710-b4ed-7d6f9d4beca5") {
          await message.reply(
            joinStringArray([
              "perhaps, a jet2 holiday may interest you?",
              "hey you guessed correctly, nice job!",
              `you also earned ${gain.toString()} tokens and now you have ${user.tokens.toString()} <:terminusfinity:1444859277515690075>!`,
              currentStreak > 0 ? `You currently have a streak of ${currentStreak.toString()}, keep it up!` : "",
            ]),
          );
        }
        await message.reply(
          joinStringArray([
            "hey you guessed correctly, nice job!",
            `you also earned ${gain.toString()} tokens and now you have ${user.tokens.toString()} <:terminusfinity:1444859277515690075>!`,
            currentStreak > 0 ? `You currently have a streak of ${currentStreak.toString()}, keep it up!` : "",
          ]),
        );
        // and saves.
        await user.save();
      } else {
        Logger.info(`user not found, creating user and adding tokens`);
        // @ts-expect-error: assertion fails for some reason even though the bot can only
        // be installed in a guild
        const newUser = createUser(message.author.id, message.guildId);
        newUser.tokens += gain;
        newUser.guessedEntries.push(number.uuid);
        // this is a fresh new profile which means it is guaranteed to have zero unique guesses.
        // so we can add it without checking.
        newUser.uniqueGuessed.push(number.uuid);
        await message.reply(
          joinStringArray([
            "hey you guessed correctly, nice job!",
            `i've also created a profile for you with ${gain.toString()} <:terminusfinity:1444859277515690075> (terminus tokens).`,
          ]),
        );
        await newUser.save();
      }
      Logger.debug(`appending streak for user ${message.author.displayName}`);
      streakCollection.appendStreak(message.author.id, message.guildId!);

      await handleSpecialGuess(message, number, "post-update");
    }
  };

  const timeout = setTimeout(
    async () => {
      Logger.info("user failed to guess in time");
      client.off("messageCreate", handler);
      guessCooldowns.set(interaction.channelId, false);
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
