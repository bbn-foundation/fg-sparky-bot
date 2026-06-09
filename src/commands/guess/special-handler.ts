/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { UserProfile } from "#db";
import { Achievements } from "#stores";
import { ACHIEVEMENT_EVENT } from "#stores-types";
import { joinStringArray } from "#utils/formatter.ts";
import type { StoredNumberInfo } from "#utils/types.ts";
import { italic, type Message, type OmitPartialGroupDMChannel, userMention } from "discord.js";

/**
 * Handle special guesses such as omni oridnal or when they follow the instructions literally.
 * @returns {Promise<boolean>} Returns whether the rest of the handler should be skipped or not.
 */
export default async function handleSpecialGuess(
  message: OmitPartialGroupDMChannel<Message>,
  number: StoredNumberInfo,
  user: UserProfile | null,
  when: "pre-parse" | "post-parse" | "post-update",
): Promise<boolean> {
  if (when === "pre-parse") {
    if (user) {
      const achs = Achievements.check(ACHIEVEMENT_EVENT.SPARKY_GUESS, user, [message.content]);
      if (achs) {
        const achMessage = achs.map(id => {
          const ach = Achievements.get(id)!;
          return `## You've unlocked a new achievement: ${ach.name}!\n${italic(ach.description)}`;
        }).join("\n");
        user.achievements = user.achievements.concat(achs);
        await message.reply(achMessage);
        await user.save();
      }
    }
    if (
      number.uuid === "c380c246-8cb9-4d78-8e5c-2de6d0fd9aad"
      && /^omni oridnal/imu.test(message.content)
    ) {
      await message.reply("omni oridnal");
      return true;
    }

    if (
      number.uuid === "17ff8a34-02af-45ac-b203-66478c962ab0"
      && /^tue finality seled/imu.test(message.content)
    ) {
      await message.reply(`${userMention(message.author.id)} died`);
      return true;
    }

    if (
      number.uuid === "e74c5b46-6517-4c1f-844f-0368120babae"
      && /^universifinity/imu.test(message.content)
    ) {
      await message.reply("i thought it was spelled like that too. it wasn't.");
      return true;
    }

    if (
      message.content.toLowerCase() === "the number, you have 40 seconds."
      || message.content.toLowerCase() === "the number, you have 60 seconds."
    ) {
      await message.reply(
        joinStringArray([
          "Good job for following the instructions. You'll make a great employee.",
          "-# Also, the achievement isn't implemented yet.",
        ]),
      );
      return true;
    }
  } else {
    // empty
  }

  return false;
}
