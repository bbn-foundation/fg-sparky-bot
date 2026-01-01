/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { None, Some, type Option } from "@fg-sparky/utils";
import { randomDifficulty } from "../helpers.ts";
import { Numbers as NumbersJsonSchema, type NumberInfo } from "./schema.ts";

export class NumberStore {
  readonly UNIQUE_ENTRIES: number;
  readonly UNIQUE_EASY_ENTRIES: number;
  readonly UNIQUE_MEDIUM_ENTRIES: number;
  readonly UNIQUE_HARD_ENTRIES: number;
  readonly UNIQUE_LEGENDARY_ENTRIES: number;
  /**
   * Constructs the {@link NumberStore} class. Because constructors cannot be asynchronous,
   * this is private and one of the static `load*` methods is used to construct the class.
   * @param data The numbers to load.
   */
  private constructor(private readonly data: Record<Difficulties, NumberInfo[]>) {
    this.UNIQUE_EASY_ENTRIES = this.data.easy.length;
    this.UNIQUE_MEDIUM_ENTRIES = this.data.medium.length;
    this.UNIQUE_HARD_ENTRIES = this.data.hard.length;
    this.UNIQUE_LEGENDARY_ENTRIES = this.data.legendary.length;
    this.UNIQUE_ENTRIES = this.UNIQUE_EASY_ENTRIES + this.UNIQUE_HARD_ENTRIES + this.UNIQUE_MEDIUM_ENTRIES + this.UNIQUE_LEGENDARY_ENTRIES;
  }

  /**
   * Reads the data from the file path specified and constructs the NumberStore class.
   * @param filePath The path to the numbers.json data.
   * @returns An instance of the {@link NumberStore} class.
   */
  static async loadFile(filePath: string): Promise<NumberStore> {
    const file = Bun.file(filePath);
    const validatedData = NumbersJsonSchema.parse(await file.json());
    return new NumberStore(validatedData);
  }

  /**
   * Validates and parses the JSON data and constructs the NumberStore class for use.
   * @param filePath The path to the numbers.json data.
   * @returns An instance of the {@link NumberStore} class.
   */
  static loadJSON(fileData: unknown): NumberStore {
    const validatedData = NumbersJsonSchema.parse(fileData);
    return new NumberStore(validatedData);
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
    const number = numbers[Math.floor(Math.random() * numbers.length)]!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return {
      number: number.name ?? "<unknown>",
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
    if (number) return Some(number);
    return None();
  }
}
