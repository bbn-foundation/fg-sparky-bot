/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  CommandInteraction,
} from "discord.js";

/**
 * The object structure that represents a slash command.
 */
export interface Command extends ChatInputApplicationCommandData {
  run: (
    client: Client,
    interaction: CommandInteraction<"raw" | "cached">,
  ) => void | Promise<void>;
  cooldown?: number | undefined;
}

/**
 * Utility type to represent slash commands being ran in a server.
 */
export type ServerSlashCommandInteraction = ChatInputCommandInteraction<
  "cached" | "raw"
>;

export interface StoredNumberInfo {
  number: string | null;
  hashedNumber: string;
  image: string;
  uuid: string;
  difficulty: Difficulties;
}

export type Difficulties = "easy" | "medium" | "hard" | "legendary";
export type Rarities = "common" | "rare" | "epic";
export type Responses = "spawn" | "fail" | "success" | "flee";
