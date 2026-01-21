/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Logger, loginFormatter } from "@fg-sparky/utils";
import { ActivityType, type Client, type Interaction } from "discord.js";
import { execSync } from "node:child_process";
import packageJson from "../package.json" with { type: "json" };
import { Commands } from "./commands/commands.ts";
import { handleSlashCommand } from "./commands/listener.ts";
import { NumberdexBaker } from "./numberdex/cron.ts";

const currentHash = () => execSync("git rev-parse --short HEAD").toString().trim();

export function registerHandlers(client: Client): void {
  client.once("clientReady", (client: Client<true>) => {
    const formattedDate = loginFormatter.format(Date.now());
    Logger.notice(`Bot running as ${client.user.username} (started at ${formattedDate})`);
    Logger.notice(`Starting cron jobs...`);
    NumberdexBaker.bakeAll();
    Logger.info(`Setting status`);
    client.user.setActivity({
      name: "custom-status",
      state: `currently running on v${packageJson.version}+${currentHash()}`,
      type: ActivityType.Custom,
    });
  });

  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      await handleSlashCommand(client, interaction, Commands);
    }
  });
}
