/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { type Difficulties, Option, type StoredNumberInfo } from "@fg-sparky/utils";
import { randomDifficulty } from "../helpers.ts";
import { type NumberInfo, Numbers as NumbersJsonSchema } from "./schema.ts";

export class NumberStore {
  /**
   * Constructs the {@link NumberStore} class. Because constructors cannot be asynchronous,
   * this is private and one of the static `load*` methods is used to construct the class.
   * @param data The numbers to load.
   */
  constructor(private readonly file: string, private data: Record<Difficulties, NumberInfo[]>) {}

  get UNIQUE_ENTRIES(): number {
    return this.UNIQUE_EASY_ENTRIES + this.UNIQUE_MEDIUM_ENTRIES + this.UNIQUE_HARD_ENTRIES + this.UNIQUE_LEGENDARY_ENTRIES;
  }

  get UNIQUE_EASY_ENTRIES(): number {
    return this.data.easy.length;
  }

  get UNIQUE_MEDIUM_ENTRIES(): number {
    return this.data.medium.length;
  }

  get UNIQUE_HARD_ENTRIES(): number {
    return this.data.hard.length;
  }

  get UNIQUE_LEGENDARY_ENTRIES(): number {
    return this.data.legendary.length;
  }

  /**
   * Creates an instance of {@link NumberStore}.
   * @returns An empty instance.
   */
  static create(file: string): NumberStore {
    return new NumberStore(file, {
      easy: [],
      medium: [],
      hard: [],
      legendary: [],
    });
  }

  /**
    * Validates and parses the data from the file passed in.
    * @returns The fully initialized class.
    */
  async load(): Promise<this> {
    const fileJSON = await Bun.file(this.file).json() as unknown;
    const validatedData = NumbersJsonSchema.parse(fileJSON);
    this.data = validatedData;
    return this;
  }

  /**
    * Saves the file data to local disk.
    */
  async save(): Promise<void> {
    const data = JSON.stringify(this.data, undefined, 2);
    await Bun.write(this.file, data);
  }

  /**
   * Returns a random entry from the collection of entries.
   * @returns The entry.
   */
  getRandom(): StoredNumberInfo {
    const difficultyPool = randomDifficulty();
    return this.getRandomByDifficulty(difficultyPool);
  }

  /**
   * Returns a random entry from the specified difficulty pool.
   * @returns The entry.
   */
  getRandomByDifficulty(difficulty: Difficulties): StoredNumberInfo {
    const numbers = this.data[difficulty];
    const number = numbers[Math.floor(Math.random() * numbers.length)]!;

    return {
      number: number.name,
      hashedNumber: number.hashedName,
      image: number.image,
      uuid: number.uuid,
      difficulty,
    };
  }

  /**
   * Returns an entry based on the UUID. Returns a Rust option if it doesn't exist.
   * @returns The entry or None.
   */
  getByID(id: string): Option<NumberInfo> {
    const data = [...this.data.easy, ...this.data.medium, ...this.data.hard, ...this.data.legendary];
    const number = data.find(value => value.uuid === id);
    return Option.from(number);
  }

  /**
   * Counts how many _unique_ entries the player has guessed for that difficulty
   * in comparison to the data within this store.
   * @returns The unique count of entries.
   */
  countEntriesUnique(difficulty: Difficulties, entries: string[]): number {
    const filtered = this.data[difficulty].filter((entry) => {
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
      for (const entry of this.data[difficulty]) {
        if (uuid === entry.uuid) return true;
      }
      return false;
    });
    return filtered.length;
  }
}
