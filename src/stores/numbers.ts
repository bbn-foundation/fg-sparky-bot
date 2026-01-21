/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { randomDifficulty } from "#utils/randoms.ts";
import type { Difficulties, StoredNumberInfo } from "#utils/types.ts";
import { type None, Option } from "@sapphire/result";
import { NumberInfo } from "./schema.ts";
import { DataStore } from "./store.ts";

export class NumberStore extends DataStore<NumberInfo> {
  /**
   * Constructs the {@link NumberStore} class, passing in a JSON file path as a backing storage.
   */
  constructor(file: string) {
    super(file, NumberInfo);
  }

  get UNIQUE_ENTRIES(): number {
    return (
      this.UNIQUE_EASY_ENTRIES
      + this.UNIQUE_MEDIUM_ENTRIES
      + this.UNIQUE_HARD_ENTRIES
      + this.UNIQUE_LEGENDARY_ENTRIES
    );
  }

  get UNIQUE_EASY_ENTRIES(): number {
    return this.data.filter((value) => value.difficulty === "easy").length;
  }

  get UNIQUE_MEDIUM_ENTRIES(): number {
    return this.data.filter((value) => value.difficulty === "medium").length;
  }

  get UNIQUE_HARD_ENTRIES(): number {
    return this.data.filter((value) => value.difficulty === "hard").length;
  }

  get UNIQUE_LEGENDARY_ENTRIES(): number {
    return this.data.filter((value) => value.difficulty === "legendary").length;
  }

  /**
   * Creates an instance of {@link NumberStore}.
   * @returns An empty instance.
   */
  static create(file: string): NumberStore {
    return new NumberStore(file);
  }

  /**
   * Returns a random entry from the collection of entries.
   * @returns The entry.
   */
  getRandom(): Option<StoredNumberInfo> {
    const difficultyPool = randomDifficulty();
    return this.getRandomByDifficulty(difficultyPool);
  }

  /**
   * Returns a random entry from the specified difficulty pool.
   * @returns The entry.
   */
  getRandomByDifficulty(difficulty: Difficulties): Option<StoredNumberInfo> {
    const reducedPool = this.data.filter((value) => value.difficulty === difficulty);
    const number = reducedPool[Math.floor(Math.random() * reducedPool.length)];

    if (!number) return Option.none as None<StoredNumberInfo>;

    return Option.from({
      number: number.name,
      hashedNumber: number.hashedName,
      image: number.image,
      uuid: number.uuid,
      difficulty,
    });
  }

  /**
   * Counts how many _unique_ entries the player has guessed for that difficulty
   * in comparison to the data within this store.
   * @returns The unique count of entries.
   */
  countEntriesUnique(difficulty: Difficulties, entries: string[]): number {
    const filtered = this.data.filter((entry) => {
      if (entry.difficulty !== difficulty) return false;
      for (const uuid of entries) {
        if (entry.uuid === uuid) return true;
      }
      return false;
    });
    return filtered.length;
  }

  /**
   * Counts how many _total_ entries the player has guessed for that difficulty
   * in comparison to the data within this store.
   * @returns The unique count of entries.
   */
  countEntriesTotal(difficulty: Difficulties, entries: string[]): number {
    const filtered = entries.filter((uuid) => {
      for (const entry of this.data) {
        if (uuid === entry.uuid && entry.difficulty === difficulty) return true;
      }
      return false;
    });
    return filtered.length;
  }
}
