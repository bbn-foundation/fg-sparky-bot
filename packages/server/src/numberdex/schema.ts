/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { z, type Rarities, type ZodType } from "@fg-sparky/utils";

export interface NumberhumanInfo {
  uuid: string;
  name: string;
  rarity: Rarities;
  hashedName: string;
  image: string;
  baseHP: number;
  baseATK: number;
  ability: string;
}

export const NumberhumanInfo: ZodType<NumberhumanInfo[]> = z.strictObject({
  uuid: z.uuid(),
  name: z.string(),
  rarity: z.enum(["common", "rare", "epic"]),
  hashedName: z.hash("sha512"),
  image: z.string(),
  baseHP: z.int(),
  baseATK: z.int(),
  ability: z.string(),
}).array();
