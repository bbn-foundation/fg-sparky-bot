import { createNumberhuman, getUser, createUser } from "#db";
import { Responses } from "#stores";
import type { NumberhumanInfo } from "#stores-types";
import { NUMBERDEX_FLEE_DELAY } from "#utils/constants.ts";
import{ joinStringArray, formatPercent } from "#utils/formatter.ts";
import { getRandomInt, getRandomRange } from "#utils/numbers.ts";
import { Message, userMention, italic, bold } from "discord.js";
import { Logger } from "#utils/logger.ts";
import { EvolutionType, getEvolutionBuff } from "./evolutions.ts";
import { createGuessHandler } from "#utils/guess-handler.ts";

const handlePlayerGuess = createGuessHandler("blake2b512");

export function messageHandler(okNumber: NumberhumanInfo, sentMessage: Message) {
  const collector = sentMessage.channel.createMessageCollector({
    dispose: true,
    time: NUMBERDEX_FLEE_DELAY - 1,
  });

  collector.once("end", async (_, reason: string) => {
    if (reason === "success") return;
    Logger.info("user failed to catch in time");
    collector.stop();

    const content = Responses.getRandom({
      type: "flee",
      correctHuman: okNumber.name,
    }).unwrapOr(`the numberhuman fled.`);
    try {
      await sentMessage.edit({
        content: sentMessage.content + '\n-# ❌ This numberhuman has despawned before you could catch it.',
      });
      await sentMessage.reply({ content, allowedMentions: { repliedUser: false } });
    } catch (err) {
      if (!Error.isError(err)) throw err;
      Logger.error(`failed to edit/reply to spawn message:`);
      Logger.error(err);
    }
  });

  collector.on("collect", async (message: Message) => {
    if (message.author.bot) return;
    if (
      handlePlayerGuess(message.content, { number: okNumber.name, hashedNumber: okNumber.hashedName })
    ) {
      collector.stop("success");
      await sentMessage.edit({
        content: sentMessage.content + `\n-# ✅ This numberhuman has been caught by ${userMention(message.author.id)}.`
      })
      await updateUserStats(message as Message<true>, okNumber);
    } else {
      const failMessage = Responses.getRandom({
        type: "fail",
        correctHuman: okNumber.name,
        guessedHuman: message.content,
        mentionId: message.author.id,
      }).unwrapOr(
        `yeah, i wished it was **${message.content}**, ${userMention(message.author.id)}.`,
      );
      if (collector.collected.size >= getRandomInt(10, 25)) {
        await message.reply(`Too many requests in 5 minutes. Try again later.`);
        collector.stop();
        return;
      }
      try {
        await message.reply(failMessage);
      } catch (error) {
        if (!Error.isError(error)) throw error;
        return;
      }
    }
  });
}

async function updateUserStats(
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
