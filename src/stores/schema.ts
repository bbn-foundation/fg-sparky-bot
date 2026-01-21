/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Difficulties, Rarities, Responses } from "#utils/types.ts";
import { z, type ZodType } from "zod";

export interface NumberhumanInfo {
  uuid: string;
  name: string;
  rarity: Rarities;
  hashedName: string;
  image: string;
  baseHP: number;
  baseATK: number;
  ability: string | null;
}

export const NumberhumanInfo: ZodType<NumberhumanInfo> = z.strictObject({
  uuid: z.uuid(),
  name: z.string(),
  rarity: z.enum(["common", "rare", "epic"]),
  hashedName: z.hash("sha512"),
  image: z.string(),
  baseHP: z.int(),
  baseATK: z.int(),
  ability: z.string().nullable(),
});

export interface ResponseInfo {
  uuid: string;
  value: string;
  type: Responses;
}

export const ResponseInfo: ZodType<ResponseInfo> = z.strictObject({
  uuid: z.uuid(),
  value: z.string(),
  type: z.enum(["fail", "success", "flee", "spawn"]),
});

export interface NumberInfo {
  uuid: string;
  image: string;
  hashedName: string;
  /**
   * possibly null because of legendaries
   */
  name: string | null;
  difficulty: Difficulties;
}

export const NumberInfo: ZodType<NumberInfo> = z.strictObject({
  uuid: z.uuid(),
  image: z.string(),
  hashedName: z.hash("sha512"),
  name: z.string().nullable(),
  difficulty: z.enum(["easy", "medium", "hard", "legendary"]),
});
