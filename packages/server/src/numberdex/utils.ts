/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { formatPercent, getRandomRange, joinStringArray, Logger, NUMBERDEX_SPAWN_MESSAGES, NUMBERDEX_SUCCESS_MESSAGES, Result } from "@fg-sparky/utils";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, userMention, type Message, type ModalMessageModalSubmitInteraction, type SendableChannels } from "discord.js";
import { createUser, getUser } from "../helpers.ts";
import { NumberhumanData } from "../users/numberhuman.ts";
import type { NumberhumanInfo } from "./schema";
import type { NumberhumanStore } from "./store.ts";

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
  const randomSpawnMessage = NUMBERDEX_SPAWN_MESSAGES[Math.floor(Math.random() * NUMBERDEX_SPAWN_MESSAGES.length)];
  try {
    for (const okHuman of numberhuman) {
      return Result.ok([
        okHuman,
        // oxlint-disable-next-line no-await-in-loop: still not a loop
        await channel.send({
          content: randomSpawnMessage ?? "hello",
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
): Promise<void> {
  const numberhuman = await createNumberhuman({
    base: number,
    bonusATK: getRandomRange(0.95, 1.15),
    bonusHP: getRandomRange(0.95, 1.15),
  });
  const responseMessage = NUMBERDEX_SUCCESS_MESSAGES[Math.floor(Math.random() * NUMBERDEX_SUCCESS_MESSAGES.length)] ?? "hey, you managed to ~~kidnap~~ catch **{correct}** {mention}!";
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
        responseMessage
          .replaceAll("{mention}", userMention(interaction.user.id))
          .replaceAll("{correct}", number.name),
        `-# bonus attack: ${formatPercent(numberhuman.bonusAtk - 1)}, bonus hp: ${formatPercent(numberhuman.bonusHP - 1)}`,
      ]));
    } else {
      user.numberhumansGuessedUnique.push(number.uuid);
      await interaction.followUp(joinStringArray([
        responseMessage
          .replaceAll("{mention}", userMention(interaction.user.id))
          .replaceAll("{correct}", number.name),
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
      responseMessage
        .replaceAll("{mention}", userMention(interaction.user.id))
        .replaceAll("{correct}", number.name),
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
