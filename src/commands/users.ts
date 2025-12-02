/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ApplicationCommandOptionType, type Client, type CommandInteraction, type User as DiscordUser } from "discord.js";
import { UserProfile } from "../entities/user-profile.ts";
import { getUser } from "../utils/user.ts";
import type { Command } from "./types.ts";

function ordinalOf(number: number): `${number}${"st" | "nd" | "rd" | "th"}` {
  const j = number % 10,
    k = number % 100;
  if (j === 1 && k !== 11) {
    return `${number}st`;
  }
  if (j === 2 && k !== 12) {
    return `${number}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${number}rd`;
  }
  return `${number}th`;
}

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
            content: `## Profile information for ${discordUser.displayName} (${discordUser.username})\nterminus tokens: ${userInfo.tokens.toString()} <:terminusfinity:1444859277515690075>`,
          });
        } else {
          await interaction.reply("sorry, fg sparky bot doesn't have data for this user");
        }
        return;
      }
      case "leaderboard": {
        const users = await UserProfile.find({ order: { tokens: "DESC" }, select: ["id", "tokens"] });
        const discordUsers: DiscordUser[] = await Promise.all(
          users.map(profile => client.users.fetch(profile.id)),
        );
        const content = `\
        # User leaderboard: \n \
        ${users.map((user, index) => {
          if (index > (interaction.options.getInteger("amount", false) ?? 9)) return "no";
          const position = ordinalOf(index + 1);
          // Sometimes an IIFE looks better then chaining ternaries
          const header = ((index) => {
            if (index === 0) return "##";
            if (index === 1) return "###";
            return "";
          })(index);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return `${header} ${position}: ${discordUsers[index]!.displayName} (${user.tokens.toString()} <:terminusfinity:1444859277515690075>)`;
        }).filter(value => value !== "no").join("\n")}
        `;
        await interaction.reply({ content });
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
  }],
};

export default User;
