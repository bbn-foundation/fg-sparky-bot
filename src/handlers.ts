/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { loginFormatter } from "#utils/formatter.ts";
import { Logger } from "#utils/logger.ts";
import { ActivityType, type Client, type Interaction } from "discord.js";
import packageJson from "../package.json" with { type: "json" };
import { handleAutocomplete, handleSlashCommand } from "./cmd-handler/listener.ts";
import { execSync } from "node:child_process";
import { Responses } from "#stores";

const currentHash = () => execSync("git rev-parse --short HEAD");

export function registerHandlers(client: Client): void {
  client.once("clientReady", (client: Client<true>) => {
    const formattedDate = loginFormatter.format(Date.now());
    Logger.notice(`Bot running as ${client.user.username} (started at ${formattedDate})`);
  });

  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      await handleSlashCommand(client, interaction);
    } else if (interaction.isAutocomplete()) {
      await handleAutocomplete(client, interaction);
    }
  });

  setInterval(() => {
    if (!client.isReady()) return;
    const splash = Responses.getRandom({
      type: "splash"
    }).unwrapOr(`currently running on v${packageJson.version}+${currentHash()}`);
    client.user.setActivity({
      name: "custom-status",
      state: splash,
      type: ActivityType.Custom,
    });
  }, 60 * 1000);
}
