/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { NumberdexBaker } from "@fg-sparky/server";
import type { Client, Interaction } from "discord.js";
import { Commands } from "./commands/commands.ts";
import { handleSlashCommand } from "./commands/listener.ts";
import { loginFormatter } from "./utils/formatter.ts";
import { Logger } from "./utils/logger.ts";

export function registerHandlers(client: Client): void {
  client.once("clientReady", (client: Client<true>) => {
    const formattedDate = loginFormatter.format(Date.now());
    Logger.notice(`Bot running as ${client.user.username} (started at ${formattedDate})`);
    Logger.notice(`Starting cron jobs...`);
    NumberdexBaker.bakeAll();
  });

  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      await handleSlashCommand(client, interaction, Commands);
    }
  });
}
