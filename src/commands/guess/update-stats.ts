import { createUser, type UserProfile } from "#db";
import type { StreakCollection } from "#fg-sparky/streaks.ts";
import { Logger } from "#utils/logger.ts";
import type { StoredNumberInfo } from "#utils/types.ts";
import { heading, italic, type Message, type OmitPartialGroupDMChannel } from "discord.js";
import handleSpecialGuess from "./special-handler.ts";
import { Achievements } from "#stores";
import { ACHIEVEMENT_EVENT } from "#stores-types";

function successMessage(args: {
  tokens: number;
  number: StoredNumberInfo;
  streak?: number | undefined;
  achs: string[]
}): string {
  const tokenGain = `you've earned ${args.tokens} <:terminusfinity:1444859277515690075>!`;
  const header = args.number.uuid === "dd35acbf-4c92-4710-b4ed-7d6f9d4beca5"
    ? `perhaps a jet 2 holiday may interest you?\nhey, you guessed correctly! nice job!`
    : `hey, you guessed correctly! nice job!`;
  const streakMessage = args.streak !== undefined ? `you currently have a ${args.streak} successful guess streak, keep it up!` : "";

  if (args.achs.length > 0) {
    const achData = args.achs.map(id => Achievements.get(id)).filter(a => a !== undefined);
    const achMessage = achData.map(a => [
      heading(`You've unlocked achievement ${a.name}!`),
      italic(a.description)
    ].join("\n")).join(`\n\n`);
    return `${achMessage}\n${header}\n${tokenGain}\n${streakMessage}`;
  } else {
    return `${header}\n${tokenGain}\n${streakMessage}`;
  }
}

export async function updateUserStats(
  message: OmitPartialGroupDMChannel<Message>,
  user: UserProfile | null,
  streakCollection: StreakCollection,
  number: StoredNumberInfo,
  guess: string,
): Promise<void> {
  const gain = streakCollection.getTokenGain(
    message.author.id,
    message.guildId!,
    number.difficulty,
  );

  Logger.debug(
    `tried looking up user ${message.author.id} (found: ${user ? "true" : "false"})`,
  );

  const currentStreak = streakCollection.get(`${message.author.id}.${message.guildId!}`);

  const newUser = user ?? createUser(message.author.id, message.guildId!);

  newUser.tokens += gain;
  newUser.guessedEntries.push(number.uuid);
  if (!newUser.uniqueGuessed.includes(number.uuid)) newUser.uniqueGuessed.push(number.uuid);

  const achs = Achievements.check(ACHIEVEMENT_EVENT.SPARKY_GUESS_SUCCESS, newUser, [newUser, guess, gain]);
  if (achs) newUser.achievements = newUser.achievements.concat(achs);

  await newUser.save();

  if (await handleSpecialGuess(message, number, "pre-parse")) {
    return;
  }

  await message.reply(successMessage({
    tokens: gain,
    number: number,
    achs: achs ?? [],
    streak: currentStreak,
  }));
  Logger.debug(`appending streak for user ${message.author.displayName}`);
  streakCollection.appendStreak(message.author.id, message.guildId!);

  await handleSpecialGuess(message, number, "post-update");
}
