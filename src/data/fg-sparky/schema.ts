/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { type Difficulties, z, type ZodType } from "@fg-sparky/utils";

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
