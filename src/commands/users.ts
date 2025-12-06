/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ApplicationCommandOptionType, type Client, type CommandInteraction } from "discord.js";
import type { Command } from "./types.ts";
import userLeaderboardDisplay from "./users/leaderboard.ts";
import userShow from "./users/show.ts";
import serverStatisticsDisplay from "./users/statistics.ts";

const User: Command = {
  async run(client: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.options.getSubcommand()) {
      case "show": {
        await userShow(client, interaction);
        return;
      }
      case "leaderboard": {
        await userLeaderboardDisplay(client, interaction);
        return;
      }
      case "statistics": {
        await serverStatisticsDisplay(client, interaction);
        return;
      }
      default: {
        await interaction.reply("not implemented yet sorry");
        return;
      }
    }
  },
  description: "User profile-related commands",
  name: "user",
  options: [{
    name: "show",
    description: "Show information about a user",
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: "user",
      description: "The user to show the profile of",
      type: ApplicationCommandOptionType.User,
      required: true,
    }],
  }, {
    name: "leaderboard",
    description: "Show who has the most terminus tokens",
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: "amount",
      description: "The top amount of people to show (defaults to 10)",
      type: ApplicationCommandOptionType.Number,
    }],
  }, {
    name: "statistics",
    description: "Show the server's statistics",
    type: ApplicationCommandOptionType.Subcommand,
  }],
};

export default User;
