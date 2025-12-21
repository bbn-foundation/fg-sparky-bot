/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { ApplicationCommandOptionType, ChannelType, type Client, type CommandInteraction } from "discord.js";
import { baker } from "../numberdex/index.ts";
import { Logger } from "../utils/logger.ts";
import type { Command } from "./types.ts";

const Numberdex: Command = {
  async run(client: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.memberPermissions.has("ManageChannels")) {
      await interaction.reply("you do not have permisison to set which channel fg sparky bot can spawn numberhumans in.");
      return;
    }
    switch (interaction.options.getSubcommand(true)) {
      case "add": {
        const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
        baker.add({
          name: `numberdex-channel-${channel.id}`,
          cron: "@every_20_minutes",
          async callback(): Promise<void> {
            Logger.info(`spawning numberhuman in channel ${channel.id}`);
            await channel.send("test");
          },
        });
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
  options: [{
    name: "add",
    description: "Adds a channel where the bot will spawn numberhumans.",
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: "channel",
      description: "The channel.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    }],
  }],
  cooldown: 0,
};

export default Numberdex;
