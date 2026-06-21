/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { getUser } from "#db";
import { Numberhumans } from "#stores";
import type { Command } from "#utils/types.ts";
import {
  ApplicationCommandOptionType,
  channelMention,
  ChannelType,
  type Client,
  type CommandInteraction,
  MessageFlags,
} from "discord.js";
import { NumberdexBaker } from "../numberdex/cron.ts";
import { setupCallback } from "../numberdex/handler.ts";
import numberdexShowHumans from "./numberdex/show-humans.ts";
import { NumberhumanSortingOrder } from "./numberdex/sorting.ts";
import { Logger } from "#utils/logger.ts";
import { numberdexTrade } from "./numberdex/trade.ts";
import { numberdexLevelUp } from "./numberdex/level-up.ts";

const Numberdex: Command = {
  async run(_client: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.options.getSubcommand(true)) {
      case "add": {
        if (!interaction.memberPermissions.has("ManageChannels")) {
          await interaction.reply({
            content: "you do not have permissison to set which channel fg sparky bot can spawn numberhumans in.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
        if (NumberdexBaker.getJobNames().includes(`numberdex-channel-${channel.id}`)) {
          await interaction.reply({
            content: "This channel already has numberdex set up.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        const cron = NumberdexBaker.add({
          name: `numberdex-channel-${channel.id}`,
          cron: "@every_5_minutes",
          async callback(): Promise<void> {},
        });
        setupCallback(Numberhumans, cron, channel);
        await interaction.reply(`added channel <#${channel.id}>.`);
        return;
      }
      case "remove": {
        if (!interaction.memberPermissions.has("ManageChannels")) {
          await interaction.reply({
            content: "you do not have permissison to set which channel fg sparky bot can spawn numberhumans in.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
        if (NumberdexBaker.getJobNames().includes(`numberdex-channel-${channel.id}`)) {
          NumberdexBaker.destroy(`numberdex-channel-${channel.id}`);
          await interaction.reply(`removed channel ${channelMention(channel.id)}`);
        } else {
          await interaction.reply(
            `numberhumans aren't spawning in ${channelMention(channel.id)} in the first place!`,
          );
        }
        return;
      }
      case "show-humans": {
        const user = interaction.options.getUser("user", false) ?? interaction.user;
        const dbUser = await getUser(user.id, interaction.guildId);
        const sortingOrder = interaction.options.getString("sorting") as NumberhumanSortingOrder | null
          ?? NumberhumanSortingOrder.ByCatchId;
        if (dbUser === null) {
          await interaction.reply({
            content: "sorry that user doesn't exist within the database",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        await numberdexShowHumans(interaction, user, sortingOrder);
        return;
      }
      case "trade": {
        const trader = interaction.user;
        const recipient = interaction.options.getUser("recipient", true);
        const traderProfile = await getUser(trader.id, interaction.guildId);
        const recipientProfile = await getUser(recipient.id, interaction.guildId);

        if (!traderProfile) {
          await interaction.reply({
            content: `you dont have a profile yet, you should catch some numberhumans first!`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        if (!recipientProfile) {
          await interaction.reply({
            content: `the person you're trying to play with has no profile yet, get them to play numberdex first!`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        await numberdexTrade(interaction, recipient, traderProfile, recipientProfile);
        return;
      }
      case "level-up": {
        await numberdexLevelUp(interaction);
        return;
      }
      default: {
        Logger.warning(`[/numberdex] user tried invoking an invalid subcommand`);
        await interaction.reply({
          content: `sorry that subcommand has not been implemented yet`,
          flags: MessageFlags.Ephemeral,
        });
        return;
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
      name: "remove",
      description: "Removes (or disable) a numberdex channel.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "The channel that has numberdex spawns.",
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
        },
        {
          name: "sorting",
          description: "Sort the list by a specific type",
          type: ApplicationCommandOptionType.String,
          choices: [
            {
              name: NumberhumanSortingOrder.ByAttack,
              value: NumberhumanSortingOrder.ByAttack,
            },
            {
              name: NumberhumanSortingOrder.ByHealth,
              value: NumberhumanSortingOrder.ByHealth,
            },
            {
              name: NumberhumanSortingOrder.ByCatchId,
              value: NumberhumanSortingOrder.ByCatchId,
            },
            {
              name: NumberhumanSortingOrder.ByEvolution,
              value: NumberhumanSortingOrder.ByEvolution,
            },
            {
              name: NumberhumanSortingOrder.ByLevel,
              value: NumberhumanSortingOrder.ByLevel,
            },
            {
              name: NumberhumanSortingOrder.ByName,
              value: NumberhumanSortingOrder.ByName,
            },
          ],
        },
      ],
    },
    {
      name: "trade",
      description: "Trade one of your numberhumans for another person's",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "trader-id",
          description: "The catch ID of the numberhuman you want to give up",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "recipient-id",
          description: "The catch ID of the numberhuman you want to get",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "recipient",
          description: "The person you want to trade with",
          type: ApplicationCommandOptionType.User,
          required: true,
        }
      ],
    },
    {
      name: "level-up",
      description: "Level up a numberhuman you have",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "id",
          description: "Numberhuman's id",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
  ],
};

export default Numberdex;
