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
import type { ChatInputApplicationCommandData, ChatInputCommandInteraction, Client, CommandInteraction } from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
  run: (client: Client, interaction: CommandInteraction) => Promise<void>;
  cooldown?: number | undefined;
}

export interface ChatInputCommand extends ChatInputApplicationCommandData {
  run: (client: Client, interaction: ChatInputCommandInteraction) => Promise<void>;
  cooldown?: number | undefined;
}
