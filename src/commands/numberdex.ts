/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { getUser } from "#db";
import type { Command } from "#utils/types.ts";
import {
  ApplicationCommandOptionType,
  ChannelType,
  type Client,
  type CommandInteraction,
  MessageFlags,
} from "discord.js";
import { NumberdexBaker } from "../numberdex/cron.ts";
import { setupCallback } from "../numberdex/handler.ts";
import { Numberhumans } from "../stores.ts";
import numberdexShowHumans from "./numberdex/show-humans.ts";

const Numberdex: Command = {
  async run(_client: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.options.getSubcommand(true)) {
      case "add": {
        if (!interaction.memberPermissions.has("ManageChannels")) {
          await interaction.reply(
            "you do not have permissison to set which channel fg sparky bot can spawn numberhumans in.",
          );
          return;
        }
        const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
        const cron = NumberdexBaker.add({
          name: `numberdex-channel-${channel.id}`,
          cron: "@every_20_minutes",
          // oxlint-disable-next-line eslint/no-empty-function: will be immediately replaced
          async callback(): Promise<void> {},
        });
        setupCallback(Numberhumans, cron, channel);
        await interaction.reply(`added channel <#${channel.id}>.`);
        return;
      }
      case "show-humans": {
        const user = interaction.options.getUser("user", true);
        const pageNumber = interaction.options.getInteger("page", true);
        const dbUser = await getUser(user.id, interaction.guildId);
        if (dbUser === null) {
          await interaction.reply({
            content: "sorry that user doesn't exist within the database",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        await numberdexShowHumans(client, interaction, user, pageNumber);
        return;
      }
      default: {
        throw new TypeError("unknown subcommand");
      }
    }
  },
  description: "Numberdex subcommands.",
  name: "numberdex",
  options: [
    {
      name: "add",
      description: "Adds a channel where the bot will spawn numberhumans.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "The channel.",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
    {
      name: "show-humans",
      description: "Show a collection of numberhumans (or your own)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "User you want to view the collection of",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "page",
          description: "The page number",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
  ],
};

export default Numberdex;
