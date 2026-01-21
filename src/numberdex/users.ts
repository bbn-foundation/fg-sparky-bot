import { createNumberhuman, createUser, getUser } from "#db";
import { Responses } from "#stores";
import type { NumberhumanInfo } from "#stores-types";
import { formatPercent, joinStringArray } from "#utils/formatter.ts";
import { Logger } from "#utils/logger.ts";
import { getRandomRange } from "#utils/numbers.ts";
import { bold, italic, type ModalMessageModalSubmitInteraction, userMention } from "discord.js";
import { EvolutionType, getEvolutionBuff } from "./evolutions.ts";

export async function updateUserStats(
  interaction: ModalMessageModalSubmitInteraction<"cached" | "raw">,
  number: NumberhumanInfo,
  guessed: string,
): Promise<void> {
  const numberhuman = createNumberhuman({
    base: number,
    bonusATK: getRandomRange(0.95, 1.15),
    bonusHP: getRandomRange(0.95, 1.15),
  });
  const responseMessage = Responses.getRandom({
    type: "success",
    correctHuman: number.name,
    guessedHuman: guessed,
    mentionId: interaction.user.id,
  }).unwrapOr(
    `hey, you managed to ~~kidnap~~ catch **${number.name}** ${
      userMention(
        interaction.user.id,
      )
    }!`,
  );

  const evolutionMessage = numberhuman.evolution === EvolutionType.None
    ? null
    : italic(
      `heyyy this numberhuman is ${bold(numberhuman.evolution)}! this gives them a ${
        getEvolutionBuff(numberhuman.evolution, "hp")
      }x boost to HP and a ${getEvolutionBuff(numberhuman.evolution, "atk")}x boost to their ATK!`,
    );
  const user = await getUser(interaction.user.id, interaction.guildId);
  Logger.debug(
    `tried looking up user ${interaction.user.id} (found: ${user ? "true" : "false"})`,
  );

  if (user) {
    Logger.info(
      `user already exists, adding the numberhuman to their collection`,
    );
    // update the player stats first...
    user.numberhumansGuessed.push(number.uuid);
    numberhuman.caughtBy = user;
    if (user.numberhumansGuessedUnique.includes(number.uuid)) {
      await interaction.followUp(
        joinStringArray([
          responseMessage,
          `(ATK: ${formatPercent(numberhuman.bonusAtk - 1)}, HP: ${formatPercent(numberhuman.bonusHP - 1)})`,
          evolutionMessage,
        ]),
      );
    } else {
      user.numberhumansGuessedUnique.push(number.uuid);
      await interaction.followUp(
        joinStringArray([
          responseMessage,
          `(ATK: ${formatPercent(numberhuman.bonusAtk - 1)}, HP: ${formatPercent(numberhuman.bonusHP - 1)})`,
          "woah is that a new numberhuman you caught??",
          evolutionMessage,
        ]),
      );
    }
    // and saves.
    await numberhuman.save();
    await user.save();
  } else {
    Logger.info(`user not found, creating user and adding the numberhuman`);
    const newUser = createUser(interaction.user.id, interaction.guildId);
    newUser.numberhumansGuessed.push(number.uuid);
    // this is a fresh new profile which means it is guaranteed to have zero unique guesses.
    // so we can add it without checking.
    newUser.numberhumansGuessedUnique.push(number.uuid);
    numberhuman.caughtBy = newUser;
    await interaction.followUp(
      joinStringArray([
        responseMessage,
        `i've also created a profile for you with that numberhuman.`,
        `(ATK: ${formatPercent(numberhuman.bonusAtk - 1)}, HP: ${formatPercent(numberhuman.bonusHP - 1)})`,
        evolutionMessage,
      ]),
    );
    await numberhuman.save();
    await newUser.save();
  }
}
