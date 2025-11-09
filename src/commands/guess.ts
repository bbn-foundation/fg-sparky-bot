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
import { ApplicationCommandOptionType, type Client, type ContextMenuCommandInteraction } from "discord.js";
import { findRandomNumber, type Difficulties } from "../numbers/get-random-number.ts";
import type { ContextMenuCommand } from "./types.ts";

const Guess: ContextMenuCommand = {
  async run(client: Client, interaction: ContextMenuCommandInteraction): Promise<void> {
    const difficulty = interaction.options.get("difficulty", true).value as Difficulties;
    const number = findRandomNumber(difficulty);
    await interaction.followUp({ content: `Guess the number, you have 60 seconds.`, files: [number.symbol] });
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
