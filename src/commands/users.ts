/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ApplicationCommandOptionType, type Client, type CommandInteraction } from "discord.js";
import { getUser } from "../utils/user.ts";
import type { Command } from "./types.ts";

const User: Command = {
  async run(client: Client, interaction: CommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.options.getSubcommand()) {
      case "show": {
        const userId = interaction.options.get("user", true).value as string;
        const userInfo = await getUser(userId);
        const discordUser = await client.users.fetch(userId);
        if (userInfo) {
          await interaction.reply({
            content: `## Profile information for ${discordUser.displayName} (${discordUser.username})\ntokens: ${userInfo.tokens.toString()}`,
          });
        } else {
          await interaction.reply("sorry, fg sparky bot doesn't have data for this user");
        }
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
  }],
};

export default User;
