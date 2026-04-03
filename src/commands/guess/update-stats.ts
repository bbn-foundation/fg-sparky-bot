import { createUser, type UserProfile } from "#db";
import type { StreakCollection } from "#fg-sparky/streaks";
import { joinStringArray } from "#utils/formatter";
import { Logger } from "#utils/logger";
import type { StoredNumberInfo } from "#utils/types";
import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import handleSpecialGuess from "./special-handler.ts";

export async function updateUserStats(
  message: OmitPartialGroupDMChannel<Message>,
  user: UserProfile | null,
  streakCollection: StreakCollection,
  number: StoredNumberInfo,
): Promise<void> {
  const gain = streakCollection.getTokenGain(
    message.author.id,
    message.guildId!,
    number.difficulty,
  );

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
    await newUser.save();
  }

  const tokenGainMessage = user
    ? `you also earned ${gain.toString()} tokens and now you have ${user.tokens.toString()} <:terminusfinity:1444859277515690075>!`
    : `i've also created a profile for you with ${gain.toString()} <:terminusfinity:1444859277515690075> (terminus tokens).`;

  if (number.uuid === "dd35acbf-4c92-4710-b4ed-7d6f9d4beca5") {
    await message.reply(
      joinStringArray([
        "perhaps, a jet2 holiday may interest you?",
        "hey you guessed correctly, nice job!",
        tokenGainMessage,
        currentStreak > 0 ? `You currently have a streak of ${currentStreak.toString()}, keep it up!` : "",
      ]),
    );
  }
  await message.reply(
    joinStringArray([
      "hey you guessed correctly, nice job!",
      tokenGainMessage,
      currentStreak > 0 ? `You currently have a streak of ${currentStreak.toString()}, keep it up!` : "",
    ]),
  );
  Logger.debug(`appending streak for user ${message.author.displayName}`);
  streakCollection.appendStreak(message.author.id, message.guildId!);

  await handleSpecialGuess(message, number, "post-update");
}
