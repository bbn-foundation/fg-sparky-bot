/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Collection, type ChatInputCommandInteraction, type Client, type Message, type OmitPartialGroupDMChannel } from "discord.js";
import { Logger } from "../../utils/logger";
import { joinStringArray } from "../../utils/string";
import { createUser, getUser } from "../../utils/user";
import { guessCooldowns } from "../cooldowns";
import type { NumberInfo } from "./get-random-number";
import handleSpecialGuess from "./special-handler";
import StreakCollection from "./streaks";

const hasher = new Bun.CryptoHasher("sha512");
const streakCollectionCollection = new Collection<string, StreakCollection>();
const streakTracker = new Collection<string, string>();

function handlePlayerGuess(message: OmitPartialGroupDMChannel<Message>, number: NumberInfo): boolean | undefined {
  if (message.author.bot) return;
  // Normalize the player's guess to a standard form to avoid weird os issues
  // like macos replacing "..." with "…" (elipis) or replacing ' with ’
  const guess = message.content.toLowerCase()
    .replaceAll(/’|‘/gu, "'") // Variants of single quotation marks
    .replaceAll(/“|”/gu, "'") // Variants of double quotation marks
    .replaceAll("…", "..."); // Ellipsis
  const hashedGuess = hasher.update(guess, "utf-8").digest("hex");
  Logger.debug(`User guessed: ${guess} (hashed: ${hashedGuess})`);
  Logger.debug(`Number: ${number.number ?? "<hidden>"} (hashed: ${number.hashedNumber})`);
  if (hashedGuess === number.hashedNumber) {
    Logger.info("user guessed correctly");
    return true;
  }
  Logger.info("user guessed incorrectly");
  return false;
}

export function handleResponse(client: Client, interaction: ChatInputCommandInteraction, number: NumberInfo): void {
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
    if (handlePlayerGuess(message, number)) {
      clearTimeout(timeout);
      client.off("messageCreate", handler);
      guessCooldowns.set(interaction.channelId, false);

      const previousPerson = streakTracker.get(interaction.channelId);
      if (previousPerson !== `${message.author.id}.${message.guildId!}`) {
        streakCollection.resetStreak(message.author.id, message.guildId!);
        streakTracker.set(interaction.channelId, `${message.author.id}.${message.guildId!}`);
      }

      const gain = streakCollection.getTokenGain(message.author.id, message.guildId!, number.difficulty);

      // @ts-expect-error: assertion fails for some reason even though the bot can only
      // be installed in a guild
      const user = await getUser(message.author.id, message.guildId);
      Logger.debug(`tried looking up user ${message.author.id} (found: ${user ? "true" : "false"})`);

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
          await message.reply(joinStringArray([
            "perhaps, a jet2 holiday may interest you?",
            "hey you guessed correctly, nice job!",
            `you also earned ${gain.toString()} tokens and now you have ${user.tokens.toString()} <:terminusfinity:1444859277515690075>!`,
            `-# current streak count: ${streakCollection.get(`${message.author.id}.${message.guildId!}`)?.toString() ?? (0).toString()}`,
          ]));
        }
        await message.reply(joinStringArray([
          "hey you guessed correctly, nice job!",
          `you also earned ${gain.toString()} tokens and now you have ${user.tokens.toString()} <:terminusfinity:1444859277515690075>!`,
          `-# current streak count: ${streakCollection.get(`${message.author.id}.${message.guildId!}`)?.toString() ?? (0).toString()}`,
        ]));
        // and saves.
        await user.save();
      } else {
        Logger.info(`user not found, creating user and adding tokens`);
        // @ts-expect-error: assertion fails for some reason even though the bot can only
        // be installed in a guild
        const newUser = await createUser(message.author.id, message.guildId);
        newUser.tokens += gain;
        newUser.guessedEntries.push(number.uuid);
        // this is a fresh new profile which means it is guaranteed to have zero unique guesses.
        // so we can add it without checking.
        newUser.uniqueGuessed.push(number.uuid);
        await message.reply(joinStringArray([
          "hey you guessed correctly, nice job!",
          `i've also created a profile for you with ${gain.toString()} <:terminusfinity:1444859277515690075> (terminus tokens).`,
        ]));
        await newUser.save();
      }
      Logger.debug(`appending streak for user ${message.author.displayName}`);
      streakCollection.appendStreak(message.author.id, message.guildId!);

      if (await handleSpecialGuess(message, number, "post-update")) {
        return;
      }
    }
  };

  const timeout = setTimeout(async () => {
    Logger.info("user failed to guess in time");
    client.off("messageCreate", handler);
    guessCooldowns.set(interaction.channelId, false);
    await streakCollection.clear();

    const content = `no one guessed in time${number.number ? `, the correct answer was ${number.number}.` : "."}`;
    await interaction.followUp({ content, allowedMentions: { repliedUser: false } });
  }, number.difficulty === "legendary" ? 60000 : 40000);

  client.on("messageCreate", handler);
}
