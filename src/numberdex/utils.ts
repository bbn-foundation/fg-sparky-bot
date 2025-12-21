/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { DiscordjsError, type SendableChannels } from "discord.js";
import { Err, Ok, type Result } from "rust-optionals";
import numberhumans from "../../numbers/numberhumans.json" with { type: "json" };

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythical";

export interface NumberhumanInfo {
  number: string;
  hashedNumber: string;
  image: string;
  uuid: string;
  rarity: Rarity;
}

function getRandomRarity(): Rarity {
  return "common";
}

export function findRandomNumber(): NumberhumanInfo {
  const rarity = getRandomRarity();
  const humanPool = numberhumans[rarity];
  const randomIndex = Math.floor(Math.random() * humanPool.length);
  const number = humanPool[randomIndex];
  // Uh yeah same here
  return {
    number: number!.name,
    hashedNumber: number!.hashedName,
    image: number!.image,
    rarity,
    uuid: number!.uuid,
  };
}

export async function spawnNumberhuman(channel: SendableChannels): Promise<Result<NumberhumanInfo, Error>> {
  const numberhuman = findRandomNumber();
  try {
    await channel.send({ content: "hello", files: [numberhuman.image] });
    return Ok(numberhuman);
  } catch (err) {
    if (err instanceof DiscordjsError) return Err(err);
    return Err("unknown error");
  }
}
