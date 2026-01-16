/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Command } from "@fg-sparky/utils";
import {
  ApplicationCommandOptionType,
  ChannelType,
  type Client,
  type CommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { NumberdexBaker } from "../numberdex/cron.ts";
import { setupCallback } from "../numberdex/handler.ts";
import { Numberhumans } from "../stores.ts";

const Numberdex: Command = {
  async run(_client: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.memberPermissions.has(["ManageChannels", "ManageRoles"])) {
      await interaction.reply(
        "you do not have permisison to set which channel fg sparky bot can spawn numberhumans in.",
      );
      return;
    }
    switch (interaction.options.getSubcommand(true)) {
      case "add": {
        const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
        const pingRole = interaction.options.getRole("ping-role");
        const cron = NumberdexBaker.add({
          name: `numberdex-channel-${channel.id}${pingRole ? `-${pingRole.id}` : ""}`,
          cron: "@every_20_minutes",
          // oxlint-disable-next-line eslint/no-empty-function: will be immediately replaced
          async callback(): Promise<void> {},
        });
        setupCallback(Numberhumans, cron, channel);
        await interaction.reply(`added channel <#${channel.id}>.`);
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
        {
          name: "ping-role",
          description: "A role to ping on every spawn.",
          type: ApplicationCommandOptionType.Role,
        },
      ],
    },
  ],
  defaultMemberPermissions: PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageRoles,
};

export default Numberdex;
