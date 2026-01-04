/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Option, type Rarities } from "@fg-sparky/utils";
import { randomRarity } from "../helpers.ts";
import { NumberhumanInfo } from "./schema.ts";

export class NumberhumanStore {
  /**
   * Constructs the {@link NumberhumanStore} class. Because constructors cannot be asynchronous,
   * this is private and one of the static `load*` methods is used to construct the class.
   * @param data The numbers to load.
   */
  private constructor(private data: NumberhumanInfo[]) {}

  /**
     * Creates an instance of {@link NumberhumanStore} without populating it with data.
     * @returns An empty instance.
     */
  static create(): NumberhumanStore {
    return new NumberhumanStore([]);
  }

  /**
    * Reads the data from the file path specified and initializes the class.
    * @param filePath The path to the numberhumans.json data.
    * @returns The fully initialized class.
    */
  async loadFile(filePath: string): Promise<this> {
    const file = Bun.file(filePath);
    const validatedData = NumberhumanInfo.parse(await file.json());
    this.data = validatedData;
    return this;
  }

  /**
    * Validates and parses the JSON data and initalizes the class.
    * @param filePath The raw JSON data.
    * @returns The fully initialized class.
    */
  loadJSON(fileData: unknown): this {
    const validatedData = NumberhumanInfo.parse(fileData);
    this.data = validatedData;
    return this;
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
    return Option.from(this.data.filter(value => value.rarity === rarity)
      .at(Math.floor(Math.random() * this.data.length)));
  }

  /**
   * Returns an entry based on the UUID. Returns a Rust option if it doesn't exist.
   * @returns The entry or None.
   */
  getByID(id: string): Option<NumberhumanInfo> {
    const number = Option.from(this.data.find(value => value.uuid === id));
    return number;
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
