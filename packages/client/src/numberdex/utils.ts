/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { createUser, getUser, NumberhumanData, type NumberhumanInfo, type NumberhumanStore } from "@fg-sparky/server";
import { formatPercent, getRandomRange, joinStringArray, Logger, Result } from "@fg-sparky/utils";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, userMention, type Message, type ModalMessageModalSubmitInteraction, type SendableChannels } from "discord.js";
import { Responses } from "../stores.ts";

export function createButtonRow(disabled?: boolean): ActionRowBuilder<ButtonBuilder> {
  const button = ButtonBuilder.from({
  // @ts-expect-error THERE SHALL BE NO URL
    customId: "numberhuman-catch-button",
    label: "Catch",
    style: ButtonStyle.Primary,
    type: ComponentType.Button,
    disabled,
  });

  return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
}

export async function spawnNumberhuman(store: NumberhumanStore, channel: SendableChannels): Promise<Result<[NumberhumanInfo, Message], Error | ReferenceError>> {
  const numberhuman = store.getRandom();
  const randomSpawnMessage = Responses.getRandom({
    type: "spawn",
  }).unwrapOr("hello");
  try {
    for (const okHuman of numberhuman) {
      return Result.ok([
        okHuman,
        // oxlint-disable-next-line no-await-in-loop: still not a loop
        await channel.send({
          content: randomSpawnMessage,
          files: [okHuman.image],
          components: [createButtonRow()],
        }),
      ]);
    }
    return Result.err(new ReferenceError("no numberhuman was found"));
  } catch (err) {
    if (!Error.isError(err)) throw err;
    return Result.err(err);
  }
}

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
  const responseMessage = Responses
    .getRandom({
      type: "success",
      correctHuman: number.name,
      guessedHuman: guessed,
      mentionId: interaction.user.id,
    })
    .unwrapOr(`hey, you managed to ~~kidnap~~ catch **${number.name}** ${userMention(interaction.user.id)}!`);
  const user = await getUser(interaction.user.id, interaction.guildId);
  Logger.debug(`tried looking up user ${interaction.user.id} (found: ${user ? "true" : "false"})`);

  if (user) {
    Logger.info(`user already exists, adding the numberhuman to their collection`);
    // update the player stats first...
    user.numberhumansGuessed.push(number.uuid);
    user.numberhumans ??= [];
    user.numberhumans.push(numberhuman);
    if (user.numberhumansGuessedUnique.includes(number.uuid)) {
      await interaction.followUp(joinStringArray([
        responseMessage,
        `-# bonus attack: ${formatPercent(numberhuman.bonusAtk - 1)}, bonus hp: ${formatPercent(numberhuman.bonusHP - 1)}`,
      ]));
    } else {
      user.numberhumansGuessedUnique.push(number.uuid);
      await interaction.followUp(joinStringArray([
        responseMessage,
        `-# bonus attack: ${formatPercent(numberhuman.bonusAtk - 1)}, bonus hp: ${formatPercent(numberhuman.bonusHP - 1)}`,
        "woah is that a new numberhuman you caught??",
      ]));
    }
    // and saves.
    await user.save();
  } else {
    Logger.info(`user not found, creating user and adding the numberhuman`);
    const newUser = await createUser(interaction.user.id, interaction.guildId);
    newUser.numberhumansGuessed.push(number.uuid);
    // this is a fresh new profile which means it is guaranteed to have zero unique guesses.
    // so we can add it without checking.
    newUser.numberhumansGuessedUnique.push(number.uuid);
    newUser.numberhumans ??= [];
    newUser.numberhumans.push(numberhuman);
    await interaction.followUp(joinStringArray([
      responseMessage,
      `i've also created a profile for you with that numberhuman.`,
      `-# bonus attack: ${formatPercent(numberhuman.bonusAtk)}, bonus hp: ${formatPercent(numberhuman.bonusHP)}`,
    ]));
    await newUser.save();
  }
}

interface NumberhumanCreationOptions {
  base: NumberhumanInfo;
  bonusHP: number;
  bonusATK: number;
}

async function createNumberhuman(options: NumberhumanCreationOptions): Promise<NumberhumanData> {
  const newHuman = new NumberhumanData();
  newHuman.bonusAtk = options.bonusATK;
  newHuman.bonusHP = options.bonusHP;
  newHuman.id = options.base.uuid;
  return await newHuman.save();
}
