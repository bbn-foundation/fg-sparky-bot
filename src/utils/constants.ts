/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { comptime } from "comptime.ts" with { type: "comptime" };
import numberdexInfo from "../../numbers/numberdex-data.json" with { type: "comptime+json" };
import numbers from "../../numbers/numbers.json" with { type: "comptime+json" };

/* Static variables */
export const UNIQUE_EASY_ENTRIES: number = numbers.easy.length;
export const UNIQUE_MEDIUM_ENTRIES: number = numbers.medium.length;
export const UNIQUE_HARD_ENTRIES: number = numbers.hard.length;
export const UNIQUE_LEGENDARY_ENTRIES: number = numbers.legendary.length;
export const UNIQUE_ENTRIES: number = comptime(UNIQUE_EASY_ENTRIES + UNIQUE_MEDIUM_ENTRIES + UNIQUE_HARD_ENTRIES + UNIQUE_LEGENDARY_ENTRIES);
export const NUMBERDEX_SPAWN_MESSAGES: string[] = numberdexInfo.responses;
