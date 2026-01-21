/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { randomRarity } from "#utils/randoms.ts";
import type { Rarities } from "#utils/types.ts";
import { Option } from "@sapphire/result";
import { NumberhumanInfo } from "./schema.ts";
import { DataStore } from "./store.ts";

export class NumberhumanStore extends DataStore<NumberhumanInfo> {
  /**
   * Constructs the {@link NumberhumanStore} class, with a path to a JSON file as the storage backing.
   */
  constructor(file: string) {
    super(file, NumberhumanInfo);
  }

  /**
   * Gets the total amount of entries that has been added to FG sparky.
   */
  get UNIQUE_ENTRIES(): number {
    return this.data.length;
  }

  /**
   * Returns a random entry from the collection of entries.
   * @returns The entry.
   */
  getRandom(): Option<NumberhumanInfo> {
    const rarityPool = randomRarity();
    return this.getRandomByRarity(rarityPool);
  }

  /**
   * Returns a random entry from the specified difficulty pool.
   * @returns The entry.
   */
  getRandomByRarity(rarity: Rarities): Option<NumberhumanInfo> {
    const filteredData = this.data.filter((value) => value.rarity === rarity);
    return Option.from(filteredData.at(Math.floor(Math.random() * filteredData.length)));
  }

  /**
   * Counts how many _unique_ numberhumans the player has guessed for that
   * specific rarity in comparison to the numberhumans stored.
   * @returns The unique count of entries.
   */
  countEntriesUnique(rarity: Rarities, entries: string[]): number {
    const filtered = this.data.filter((entry) => {
      for (const uuid of entries) {
        if (entry.uuid === uuid && entry.rarity === rarity) return true;
      }
      return false;
    });
    return filtered.length;
  }

  /**
   * Counts how many _total_ numberhumans the player has guessed for that
   * specific rarity in comparison to the numberhumans stored.
   * @returns The unique count of entries.
   */
  countEntriesTotal(rarity: Rarities, entries: string[]): number {
    const filtered = entries.filter((uuid) => {
      for (const entry of this.data) {
        if (uuid === entry.uuid && entry.rarity === rarity) return true;
      }
      return false;
    });
    return filtered.length;
  }
}
