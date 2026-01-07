/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import responses from "../../../numbers/responses.json" with { type: "comptime+json" };

/* Constant constants */
export const NUMBERDEX_FLEE_DELAY: number = 5 * 60 * 1000;

/* Statics */
export const NUMBERDEX_SPAWN_MESSAGES: readonly string[] = responses.spawn;
export const NUMBERDEX_FAIL_MESSAGES: readonly string[] = responses.fail;
export const NUMBERDEX_SUCCESS_MESSAGES: readonly string[] = responses.success;
