/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Command } from "@fg-sparky/utils";
import { ApplicationCommandOptionType, type Client, type CommandInteraction } from "discord.js";

const User: Command = {
  async run(client: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.options.getSubcommand()) {
      case "submit": {
        return;
      }
      default: {
        await interaction.reply("not implemented yet sorry");
      }
    }
  },
  description: "FG sparky-related commands",
  name: "fg-sparky",
  options: [{
    name: "submit",
    description: "Submits an entry for sky to add",
    type: ApplicationCommandOptionType.Subcommand,
  }, {
    name: "submit-batch",
    description: "Submits a batch of entries for the owner to add",
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: "batchfile",
      description: "A zip/tar file of the batched up images to add",
      type: ApplicationCommandOptionType.Attachment,
      required: true,
    }, {
      name: "difficulty",
      description: "Difficulty for the batch",
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: "Easy", value: "easy" },
        { name: "Medium", value: "medium" },
        { name: "Hard", value: "hard" },
        { name: "Legendary", value: "legendary" },
      ],
    }],
  }],
};

export default User;
