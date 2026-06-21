import { createNumberhuman, createUser, getUser } from "#db";

import { Responses } from "#stores";
import type { NumberhumanInfo } from "#stores-types";
import { formatPercent, joinStringArray } from "#utils/formatter.ts";
import { Logger } from "#utils/logger.ts";
import { getRandomRange } from "#utils/numbers.ts";
import { bold, italic, Message, userMention } from "discord.js";
import { EvolutionType, getEvolutionBuff } from "./evolutions.ts";

export async function updateUserStats(
  message: Message<true>,
  number: NumberhumanInfo,
): Promise<void> {
  const numberhuman = createNumberhuman({
    base: number,
    bonusATK: getRandomRange(0.95, 1.15),
    bonusHP: getRandomRange(0.95, 1.15),
  });
  const responseMessage = Responses.getRandom({
    type: "success",
    correctHuman: number.name,
    guessedHuman: message.content,
    mentionId: message.author.id,
  }).unwrapOr(
    `hey, you managed to ~~kidnap~~ catch **${number.name}** ${userMention(message.author.id)}!`,
  );

  const evolutionMessage = numberhuman.evolution === EvolutionType.None
    ? null
    : italic(
      `heyyy this numberhuman is ${bold(numberhuman.evolution)}! this gives them a ${
        getEvolutionBuff(numberhuman.evolution, "hp")
      }x boost to HP and a ${getEvolutionBuff(numberhuman.evolution, "atk")}x boost to their ATK!`,
    );
  const user = await getUser(message.author.id, message.guildId);
  Logger.debug(
    `tried looking up user ${message.author.id} (found: ${user ? "true" : "false"})`,
  );

  if (user) {
    Logger.info(
      `user already exists, adding the numberhuman to their collection`,
    );
    // update the player stats first...
    user.numberhumansGuessed.push(number.uuid);
    numberhuman.caughtBy = user;
    if (user.numberhumansGuessedUnique.includes(number.uuid)) {
      await message.reply(
        joinStringArray([
          responseMessage,
          `(ATK: ${formatPercent(numberhuman.bonusAtk - 1)}, HP: ${formatPercent(numberhuman.bonusHP - 1)})`,
          evolutionMessage,
        ]),
      );
    } else {
      user.numberhumansGuessedUnique.push(number.uuid);
      await message.reply(
        joinStringArray([
          responseMessage,
          `(ATK: ${formatPercent(numberhuman.bonusAtk - 1)}, HP: ${formatPercent(numberhuman.bonusHP - 1)})`,
          "woah is that a new numberhuman you caught??",
          evolutionMessage,
        ]),
      );
    }
    // and saves.
    await user.save();
    await numberhuman.save();
  } else {
    Logger.info(`user not found, creating user and adding the numberhuman`);
    const newUser = createUser(message.author.id, message.guildId);
    newUser.numberhumansGuessed.push(number.uuid);
    // this is a fresh new profile which means it is guaranteed to have zero unique guesses.
    // so we can add it without checking.
    newUser.numberhumansGuessedUnique.push(number.uuid);
    numberhuman.caughtBy = newUser;
    await message.reply(
      joinStringArray([
        responseMessage,
        `i've also created a profile for you with that numberhuman.`,
        `(ATK: ${formatPercent(numberhuman.bonusAtk - 1)}, HP: ${formatPercent(numberhuman.bonusHP - 1)})`,
        evolutionMessage,
      ]),
    );
    await newUser.save();
    await numberhuman.save();
  }
}
