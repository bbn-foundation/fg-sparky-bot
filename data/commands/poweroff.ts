/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Command } from "#utils/types.ts";
import type { Client, CommandInteraction } from "discord.js";

const Poweroff: Command = {
  async run(_client: Client, interaction: CommandInteraction): Promise<void> {
    if (interaction.user.id !== "1051147056481308744") {
      await interaction.reply("hey don't shut off the bot you're not <@1051147056481308744>");
      return;
    }
    await interaction.reply("Sorry I gotta sleep, see ya later!");
    await Bun.$`/bin/systemctl poweroff`;
    // Should never return
    await Bun.sleep(Number.MAX_SAFE_INTEGER);
  },
  description: "Turn the bot off",
  name: "poweroff",
};

export default Poweroff;
