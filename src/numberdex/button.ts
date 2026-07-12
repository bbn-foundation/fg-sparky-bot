import { createNumberhuman, getUser, createUser } from "#db";
import { Responses } from "#stores";
import { NumberhumanInfo } from "#stores-types";
import { NUMBERDEX_FLEE_DELAY } from "#utils/constants.ts";
import { joinStringArray, formatPercent } from "#utils/formatter.ts";
import { getRandomRange } from "#utils/numbers.ts";
import { bold, ComponentType, italic, Message, TextInputStyle, userMention, type ModalComponentData, type ModalSubmitInteraction } from "discord.js";
import { Logger } from "#utils/logger.ts";
import { EvolutionType, getEvolutionBuff } from "./evolutions.ts";
import { createGuessHandler } from "#utils/guess-handler.ts";
import { createButtonRow } from "./utils.ts";

const handlePlayerGuess = createGuessHandler("blake2b512");

export async function updateUserStats(
  interaction: ModalSubmitInteraction<"cached" | "raw">,
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
      await interaction.reply(
        joinStringArray([
          responseMessage,
          `(ATK: ${formatPercent(numberhuman.bonusAtk - 1)}, HP: ${formatPercent(numberhuman.bonusHP - 1)})`,
          evolutionMessage,
        ]),
      );
    } else {
      user.numberhumansGuessedUnique.push(number.uuid);
      await interaction.reply(
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
    const newUser = createUser(interaction.user.id, interaction.guildId);
    newUser.numberhumansGuessed.push(number.uuid);
    // this is a fresh new profile which means it is guaranteed to have zero unique guesses.
    // so we can add it without checking.
    newUser.numberhumansGuessedUnique.push(number.uuid);
    numberhuman.caughtBy = newUser;
    await interaction.reply(
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


const createGuessModal = (channelId: string, interactionId: string): ModalComponentData => ({
  title: "yeah",
  id: channelId,
  customId: `numberhuman-guess-modal-${interactionId}`,
  components: [
    {
      id: 0,
      label: "what's the human's name?",
      type: ComponentType.Label,
      // @ts-expect-error: labels are not allowed in text input components
      component: {
        customId: `numberhuman-guess-input-${channelId}`,
        style: TextInputStyle.Short,
        type: ComponentType.TextInput,
      },
    },
  ],
});

export function catchButtonHandler(okNumber: NumberhumanInfo, sentMessage: Message) {
  const collector = sentMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: NUMBERDEX_FLEE_DELAY,
  });
  let caught = false;

  collector.on("collect", async (interaction) => {
    Logger.debug(`User ${interaction.user.displayName} clicked the button`);
    await interaction.showModal(createGuessModal(interaction.channelId, interaction.id));

    const submission = await interaction.awaitModalSubmit({
      filter: i => i.customId === `numberhuman-guess-modal-${interaction.id}`,
      time: NUMBERDEX_FLEE_DELAY,
    }).catch(error => {
      Logger.error(error);
      return null;
    });

    if (submission) {
      Logger.debug(
        `User ${interaction.user.displayName} submitted the numberhuman, verifying it's correct...`,
      );
      const guess = submission.fields.getTextInputValue(
        `numberhuman-guess-input-${submission.channelId}`,
      );
      if (caught) {
        await submission.reply(`oops someone stole the numberhuman from you ${userMention(submission.user.id)} sorry`);
        return;
      }
      if (
        handlePlayerGuess(guess, { number: okNumber.name, hashedNumber: okNumber.hashedName })
      ) {
        caught = true;
        collector.stop();
        await sentMessage.edit({
          components: [createButtonRow(true)],
        });
        await updateUserStats(submission as ModalSubmitInteraction<"raw" | "cached">, okNumber, guess);
      } else {
        const failMessage = Responses.getRandom({
          type: "fail",
          correctHuman: okNumber.name,
          guessedHuman: guess,
          mentionId: interaction.user.id,
        }).unwrapOr(
          `yeah, i wished it was **${guess}**, ${userMention(interaction.user.id)}.`,
        );
        await submission.reply(failMessage);
      }
    }
  });

  collector.once("end", async () => {
    if (caught) return;
    Logger.info("user failed to catch in time");

    const content = Responses.getRandom({
      type: "flee",
      correctHuman: okNumber.name,
    }).unwrapOr(`the numberhuman fled.`);
    try {
      await sentMessage.edit({ components: [createButtonRow(true)] });
      await sentMessage.reply({ content, allowedMentions: { repliedUser: false } });
    } catch (err) {
      if (!Error.isError(err)) throw err;
      Logger.error(`failed to edit/reply to spawn message:`);
      Logger.error(err);
    }
  });
}
