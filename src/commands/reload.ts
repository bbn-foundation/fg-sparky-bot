/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Numberhumans, Numbers, Responses } from "#stores";
import type { Command } from "#utils/types.ts";
import { ApplicationCommandOptionType, type Client, type CommandInteraction, MessageFlags, PermissionFlagsBits } from "discord.js";

enum ReloadStoreType {
  SparkyEntries = "sparky-entries",
  // oxlint-disable-next-line no-shadow
  Numberhumans = "numberhumans",
  // oxlint-disable-next-line no-shadow
  Responses = "responses",
}

const Reload: Command = {
  async run(_: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    switch (interaction.options.getString("store", true) as ReloadStoreType) {
      case ReloadStoreType.Numberhumans: {
        await Numberhumans.reload();
        await interaction.reply({
          content: "reloaded numberhuman store.",
          flags: MessageFlags.Ephemeral,
        });
        break;
      }
      case ReloadStoreType.SparkyEntries: {
        await Numbers.reload();
        await interaction.reply({
          content: "reloaded numbers store.",
          flags: MessageFlags.Ephemeral,
        });
        break;
      }
      case ReloadStoreType.Responses: {
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
  options: [{
    name: "store",
    description: "The store type to reload.",
    type: ApplicationCommandOptionType.String,
    required: true,
    choices: [
      {
        name: "FG Sparky Entries",
        value: ReloadStoreType.SparkyEntries,
      },
      {
        name: "Numberhuman Entries",
        value: ReloadStoreType.Numberhumans,
      },
      {
        name: "Numberdex Responses",
        value: ReloadStoreType.Responses,
      },
    ],
  }],
};

export default Reload;
