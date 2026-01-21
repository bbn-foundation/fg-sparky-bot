/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { type None, Option, type ZodType } from "@fg-sparky/utils";

interface DataStoreEntry {
  uuid: string;
}

/**
 * A map-equivalent data class that is used for anything in sparky that has an id,
 * to facilitate hot-reloading and updating on the fly.
 */
export class DataStore<T extends DataStoreEntry = DataStoreEntry> {
  /**
   * Creates an instance of the data store, validated with a specific schema.
   * @returns An empty instance.
   */
  constructor(
    private readonly file: string,
    protected schema: ZodType<T>,
    protected data: T[] = [],
  ) {}

  /**
   * Reloads the data stored within, merging it with the data stored in memory.
   * @param [merge=false] Whetever or not to merge the data.
   * @returns The fully initialized class.
   */
  async reload(merge = false): Promise<this> {
    if (merge) {
      const oldData = structuredClone(this.data);
      const newData = await this.schema
        .array()
        .parseAsync((await Bun.file(this.file).json()) as unknown);
      const mergedData = Object.assign(oldData, newData);
      this.data = mergedData;
      await this.save();
      return this;
    }

    await this.load();
    return this;
  }

  /**
   * Validates and parses the data from the file passed in.
   * @returns The fully initialized class.
   */
  async load(): Promise<this> {
    const fileJSON = (await Bun.file(this.file).json()) as unknown;
    const validatedData = await this.schema.array().parseAsync(fileJSON);
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
   * Adds an entry (or entries) to the store and saves it to disk.
   */
  async add(...entries: T[]): Promise<this> {
    const validatedData = await this.schema.array().parseAsync(entries);
    this.data.push(...validatedData);
    await this.save();
    return this;
  }

  /**
   * Removes an entry (or entries) from the store by its id.
   */
  async remove(...entries: string[]): Promise<this> {
    this.data = this.data.filter((data) => {
      for (const id of entries) {
        if (data.uuid === id) return false;
      }
      return true;
    });
    await this.save();
    return this;
  }

  /**
   * Gets an entry by its id.
   */
  get(id: string): Option<T> {
    return Option.from(this.data.find((data) => data.uuid === id));
  }

  /**
   * Checks if the internal store has the entry.
   */
  has(id: string): boolean {
    return this.data.some((data) => data.uuid === id);
  }

  /**
   * Updates an entry by its id if it exists.
   */
  update(id: string, newData: Partial<Omit<T, "uuid">>): Option<T> {
    if (this.has(id)) {
      const existingEntry = this.get(id).expect(
        "the entry should not be undefined as we just checked it was",
      );
      return Option.from(
        this.set(id, {
          ...existingEntry,
          ...newData,
        }),
      );
    }

    return Option.none as None<T>;
  }

  /**
   * Set the data for an entry by its id.
   * @returns The new entry.
   */
  set(id: string, data: Omit<T, "uuid">): T {
    const validatedData = this.schema.parse({ ...data, uuid: id });
    const existingData = this.data.findIndex((value) => value.uuid === id);
    if (existingData === -1) this.data.push(validatedData);
    else this.data[existingData] = validatedData;
    return validatedData;
  }
}
