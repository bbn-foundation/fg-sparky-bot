/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { joinStringArray, type StoredNumberInfo } from "@fg-sparky/utils";
import type { Message, OmitPartialGroupDMChannel } from "discord.js";

/**
 * Handle special guesses such as omni oridnal or when they follow the instructions literally.
 * @returns {Promise<boolean>} Returns whether the rest of the handler should be skipped or not.
 */
export default async function handleSpecialGuess(
  message: OmitPartialGroupDMChannel<Message>,
  number: StoredNumberInfo,
  when: "pre-parse" | "post-parse" | "post-update",
): Promise<boolean> {
  if (when === "pre-parse") {
    if (
      number.uuid === "c380c246-8cb9-4d78-8e5c-2de6d0fd9aad"
      && /^omni oridnal/imu.test(message.content)
    ) {
      await message.reply("omni oridnal");
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
