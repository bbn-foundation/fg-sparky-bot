import { createUser, getUser, NumberhumanData, type NumberhumanInfo } from "@fg-sparky/server";
import {
  EvolutionType,
  formatPercent,
  getEvolutionBuff,
  getRandomInt,
  getRandomRange,
  joinStringArray,
  Logger,
} from "@fg-sparky/utils";
import { bold, italic, userMention, type ModalMessageModalSubmitInteraction } from "discord.js";
import { Responses } from "../stores.ts";

export async function updateUserStats(
  interaction: ModalMessageModalSubmitInteraction<"cached" | "raw">,
  number: NumberhumanInfo,
  guessed: string,
): Promise<void> {
  const numberhuman = await createNumberhuman({
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
      `heyyy this numberhuman is ${
        bold(
          numberhuman.evolution,
        )
      }! this gives them a ${getEvolutionBuff(numberhuman.evolution, "hp")}x boost to HP and a ${
        getEvolutionBuff(numberhuman.evolution, "atk")
      }x boost to their ATK!`,
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
          `-# bonus attack: ${
            formatPercent(
              numberhuman.bonusAtk - 1,
            )
          }, bonus hp: ${formatPercent(numberhuman.bonusHP - 1)}`,
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
    const newUser = await createUser(interaction.user.id, interaction.guildId);
    newUser.numberhumansGuessed.push(number.uuid);
    // this is a fresh new profile which means it is guaranteed to have zero unique guesses.
    // so we can add it without checking.
    newUser.numberhumansGuessedUnique.push(number.uuid);
    numberhuman.caughtBy = newUser;
    await interaction.followUp(
      joinStringArray([
        responseMessage,
        `i've also created a profile for you with that numberhuman.`,
        `-# bonus attack: ${
          formatPercent(
            numberhuman.bonusAtk,
          )
        }, bonus hp: ${formatPercent(numberhuman.bonusHP)}`,
        evolutionMessage,
      ]),
    );
    await numberhuman.save();
    await newUser.save();
  }
}

interface NumberhumanCreationOptions {
  base: NumberhumanInfo;
  bonusHP: number;
  bonusATK: number;
}

const EvolutionRarity: [EvolutionType, number][] = [
  [EvolutionType.Absolute, 500],
  [EvolutionType.Corrupt, 400],
  [EvolutionType.Transcendent, 300],
  [EvolutionType.Zyrolexic, 200],
  [EvolutionType.Subeuclidean, 175],
  [EvolutionType.Corrotechnic, 125],
  [EvolutionType.Eternal, 90],
  [EvolutionType.Celestial, 48],
  [EvolutionType.Endfimidian, 25],
  [EvolutionType.Mastered, 16],
  [EvolutionType.Superscaled, 8],
  [EvolutionType.None, 1],
];

function randomEvolution(): EvolutionType {
  for (const [evol, rarity] of EvolutionRarity) {
    const randomInt = getRandomInt(1, rarity);
    Logger.debug(
      `checking for evolution ${evol} (within a 1 in ${rarity} chance, got ${randomInt})`,
    );
    if (randomInt === rarity) return evol;
  }
  Logger.debug("couldn't get any");
  return EvolutionType.None;
}

async function createNumberhuman(
  options: NumberhumanCreationOptions,
): Promise<NumberhumanData> {
  const newHuman = new NumberhumanData();
  newHuman.bonusAtk = options.bonusATK;
  newHuman.bonusHP = options.bonusHP;
  newHuman.id = options.base.uuid;
  newHuman.evolution = randomEvolution();
  return await newHuman.save();
}
