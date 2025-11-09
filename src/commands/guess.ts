/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { ApplicationCommandOptionType, type ChatInputCommandInteraction, type Client, type Message, type OmitPartialGroupDMChannel } from "discord.js";
import { findRandomNumber, type Difficulties, type NumberInfo } from "../numbers/get-random-number.ts";
import { Logger } from "../utils/logger.ts";
import type { ChatInputCommand } from "./types.ts";

const hasher = new Bun.CryptoHasher("sha512");

function handlePlayerGuess(message: OmitPartialGroupDMChannel<Message>, number: NumberInfo): boolean | undefined {
  if (message.author.bot) return;
  const guess = message.content.toLowerCase();
  const hashedGuess = hasher.update(guess, "utf-8").digest("hex");
  Logger.debug(`User guessed: ${guess} (hashed: ${hashedGuess})`);
  Logger.debug(`Number: ${number.number} (hashed: ${number.hashedNumber})`);
  if (hashedGuess === number.hashedNumber) {
    Logger.info("user guessed correctly");
    return true;
  }
  Logger.info("user guessed incorrectly");
  return false;
}

const Guess: ChatInputCommand = {
  async run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    const difficulty = interaction.options.get("difficulty", true).value as Difficulties;
    if (difficulty !== "easy") {
      Logger.warn(`User specified the ${difficulty} difficulty but that is currently not implemented!`);
      await interaction.reply(`sorry uh the ${difficulty} is not implemented yet`);
      return;
    }
    const number = findRandomNumber(difficulty);
    await interaction.reply({ content: `Guess the number, you have ${(number.difficulty === "legendary" ? 60 : 40).toString()} seconds.`, files: [number.symbol] });
    Logger.debug("setting up timeout");
    const handler = async (message: OmitPartialGroupDMChannel<Message>) => {
      if (message.channelId !== interaction.channelId) return;
      if (handlePlayerGuess(message, number)) {
        Logger.debug("user guessed correctly, replying and clearing timeout");
        clearTimeout(timeout);
        client.off("messageCreate", handler);
        await message.reply({ content: "guessed correctly" });
      }
    };
    const timeout = setTimeout(async () => {
      Logger.info("user failed to guess in time");
      await interaction.followUp({ content: "timed out", allowedMentions: { repliedUser: false } });
      client.off("messageCreate", handler);
    }, number.difficulty === "legendary" ? 60000 : 40000);
    client.on("messageCreate", handler);
  },
  description: "Generates a number that you have to guess.",
  name: "guess",
  options: [{
    name: "difficulty",
    description: "Select how difficult the guess will be",
    type: ApplicationCommandOptionType.String,
    required: true,
    choices: [
      { name: "Easy", value: "easy" },
      { name: "Medium", value: "medium" },
      { name: "Hard", value: "hard" },
      { name: "Random", value: "random" },
    ],
  }],
};

export default Guess;
