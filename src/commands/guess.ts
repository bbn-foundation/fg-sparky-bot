/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ApplicationCommandOptionType, type Client, type CommandInteraction } from "discord.js";
import { Logger } from "../utils/logger.ts";
import { findRandomNumber, type Difficulties } from "./get-random-number.ts";
import { handleResponse } from "./guess-handler.ts";
import type { Command } from "./types.ts";

const Guess: Command = {
  async run(client: Client, interaction: CommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) {
      Logger.error(`Tried invoking command ${this.name} as something other then a slash command`);
      await interaction.reply("This command must be run as a slash command (eg. as /guess)!");
      return;
    }

    const difficulty = interaction.options.get("difficulty", true).value as Difficulties;
    const number = findRandomNumber(difficulty);
    Logger.info(`Player requested for number of difficulty ${difficulty}, which has an id of ${number.uuid}`);

    // The message that will be sent to the player, specifiying the difficulty,
    // and the amount of time they get to guess it.
    // THere's some special flair for legendary difficulties.
    const content = number.difficulty === "legendary"
      ? `**DIFFICULTY: LEGENDARY**\nGuess the number, you have **60** seconds.`
      : `Difficulty: ${number.difficulty}\nGuess the number, you have **40** seconds.`;
    await interaction.reply({ content: content + "\n-# DEV ENVIRONMENT, DON'T EXPECT YOUR STATS TO SAVE.", files: [number.symbol] });

    Logger.debug("setting up timeout");
    handleResponse(client, interaction, number);
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
  cooldown: 10,
};

export default Guess;
