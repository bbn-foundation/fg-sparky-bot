/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Rarities } from "./types.ts";

type Difficulties = "easy" | "medium" | "hard" | "legendary";

interface DifficultyTokenMap {
  easy: 10;
  medium: 25;
  hard: 50;
  legendary: 500;
}

// please don't mind the `as never` cast, that's just typescript being stupid
// oxlint-disable no-unsafe-type-assertion
export function getGainFromDifficulty<T extends keyof DifficultyTokenMap>(
  difficulty: T,
): DifficultyTokenMap[T] {
  switch (difficulty) {
    case "easy": {
      return 10 as never;
    }
    case "medium": {
      return 25 as never;
    }
    case "hard": {
      return 50 as never;
    }
    case "legendary": {
      return 500 as never;
    }
  }
}
// oxlint-enable no-unsafe-type-assertion

export function ordinalOf(
  number: number,
): `${number}${"st" | "nd" | "rd" | "th"}` {
  const j = number % 10,
    k = number % 100;
  if (j === 1 && k !== 11) {
    return `${number}st`;
  }
  if (j === 2 && k !== 12) {
    return `${number}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${number}rd`;
  }
  return `${number}th`;
}

export function countEntriesUnique<
  T extends Record<Difficulties, { uuid: string }[]>,
>(numbers: T, difficulty: Difficulties, entries: string[]): number {
  const filtered = numbers[difficulty].filter((entry) => {
    for (const uuid of entries) {
      if (entry.uuid === uuid) return true;
    }
    return false;
  });
  return filtered.length;
}

export function countEntriesTotal<
  T extends Record<Difficulties, { uuid: string }[]>,
>(numbers: T, difficulty: Difficulties, entries: string[]): number {
  const filtered = entries.filter((uuid) => {
    for (const entry of numbers[difficulty]) {
      if (uuid === entry.uuid) return true;
    }
    return false;
  });
  return filtered.length;
}

export function countHumansUnique<
  T extends Record<Rarities, { uuid: string }[]>,
>(numberhumans: T, rarity: Rarities, entries: string[]): number {
  const filtered = numberhumans[rarity].filter((entry) => {
    for (const uuid of entries) {
      if (entry.uuid === uuid) return true;
    }
    return false;
  });
  return filtered.length;
}

export function countHumansTotal<
  T extends Record<Rarities, { uuid: string }[]>,
>(numberhumans: T, rarity: Rarities, entries: string[]): number {
  const filtered = entries.filter((uuid) => {
    for (const entry of numberhumans[rarity]) {
      if (uuid === entry.uuid) return true;
    }
    return false;
  });
  return filtered.length;
}

export function getRandomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function getRandomInt(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}
