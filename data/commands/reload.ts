/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Logger } from "#utils/logger.ts";
import type { Command } from "#utils/types.ts";
import { ApplicationCommandOptionType, type Client, type CommandInteraction, PermissionFlagsBits } from "discord.js";
import { ReloadStoreType } from "./reload/common.ts";
import reloadCmdCommand from "./reload/reload-command.ts";
import reloadStoreCommand from "./reload/reload-store.ts";

const Reload: Command = {
  async run(client: Client, interaction: CommandInteraction<"raw" | "cached">): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.user.id !== "1051147056481308744") {
      await interaction.reply("you do not have permissison to reload commands.");
      return;
    }
    switch (interaction.options.getSubcommand(true)) {
      case "command": {
        await reloadCmdCommand(client, interaction);
        break;
      }
      case "store": {
        await reloadStoreCommand(client, interaction);
        break;
      }
      default: {
        Logger.error(`user tried invoking nonexistent subcommand: /reload ${interaction.options.getSubcommand(true)}`);
        await interaction.reply("sorry that subcommand isn't implemented yet");
      }
    }
  },
  description: "Reloads the bot's internal store",
  name: "reload",
  options: [
    {
      name: "command",
      description: "Reload a specific command",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "store",
      description: "Reload a data store",
      type: ApplicationCommandOptionType.Subcommand,
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
    },
  ],
  defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
};

export default Reload;
