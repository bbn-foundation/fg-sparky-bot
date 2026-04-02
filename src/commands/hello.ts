/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Command } from "#utils/types.ts";
import type { Client, CommandInteraction } from "discord.js";

const Hello: Command = {
  async run(_client: Client, interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Hi chat");
  },
  description: "Say hi to the bot",
  name: "hello",
};

export default Hello;
