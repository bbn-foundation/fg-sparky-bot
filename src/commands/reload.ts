/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Command } from "#utils/types.ts";
import {
  ApplicationCommandOptionType,
  type Client,
  type CommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { Numberhumans, Numbers, Responses } from "../stores.ts";

enum ReloadType {
  SparkyEntries = "sparky-entries",
  Numberhumans = "numberhumans",
  Responses = "responses",
}

const Reload: Command = {
  async run(_client: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.memberPermissions.has("ManageChannels")) {
      await interaction.reply("you do not have permissison to reload commands.");
      return;
    }
    // oxlint-disable-next-line no-unsafe-type-assertion: see the options below
    switch (interaction.options.getString("store", true) as ReloadType) {
      case ReloadType.Numberhumans: {
        await Numberhumans.reload();
        await interaction.reply({
          content: "reloaded numberhuman store.",
          flags: MessageFlags.Ephemeral,
        });
        break;
      }
      case ReloadType.SparkyEntries: {
        await Numbers.reload();
        await interaction.reply({
          content: "reloaded numbers store.",
          flags: MessageFlags.Ephemeral,
        });
        break;
      }
      case ReloadType.Responses: {
        await Responses.reload();
        await interaction.reply({
          content: "reloaded responses store.",
          flags: MessageFlags.Ephemeral,
        });
        break;
      }
      default: {
        await interaction.reply("sorry idk what store that is");
        break;
      }
    }
  },
  description: "Reloads the bot's internal store",
  name: "reload",
  options: [
    {
      name: "store",
      description: "The store type to reload.",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "FG Sparky Entries",
          value: ReloadType.SparkyEntries,
        },
        {
          name: "Numberhuman Entries",
          value: ReloadType.Numberhumans,
        },
        {
          name: "Numberdex Responses",
          value: ReloadType.Responses,
        },
      ],
    },
  ],
  defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
};

export default Reload;
