/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
export const loginFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  "en-US",
  {
    dateStyle: "long",
    timeStyle: "short",
  },
);
export const loggerFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  "en-US",
  {
    dateStyle: "short",
    timeStyle: "medium",
  },
);

/**
 * Returns a percentage of the `number` value.
 * @param number The number to format.
 * @param precision The amount of decimal digits to show.
 * @returns The percentage.
 */
export function formatPercent(number: number, precision = 1): string {
  return `${(number * 100).toFixed(precision)}%`;
}

export function formatAdd(number: number, precision = 1): string {
  return `${number < 0 ? "" : "+"}${number.toFixed(precision)}`;
}

/**
 * Takes an array of strings and joins them together with a different string.
 * Useful for proper formatting.
 */
export function joinStringArray(
  array: (string | undefined | null)[],
  joiner = "\n",
): string {
  return array.filter(Boolean).join(joiner);
}
