/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Takes an array of strings and joins them together with a different string.
 * Useful for proper formatting.
 */
export function joinStringArray(array: string[], joiner = "\n"): string {
  return array.join(joiner);
}
