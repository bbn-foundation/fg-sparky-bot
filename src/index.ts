/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { Client, type Interaction } from "discord.js";
import { handleSlashCommand, registerCommands } from "./commands/listener.ts";
import { Commands } from "./commands/commands.ts";
import { Logger } from "./utils/logger.ts";
import config from "../.config.json";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("clientReady", (client: Client<true>) => {
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" });
  const formattedDate = formatter.format(Date.now());
  Logger.notice(`Bot running as ${client.user.username} (started at ${formattedDate})`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isCommand() || interaction.isContextMenuCommand()) {
    await handleSlashCommand(client, interaction, Commands);
  }
});

registerCommands(client, Commands);

Logger.info("Logging in");
await client.login(config.DISCORD_TOKEN);
