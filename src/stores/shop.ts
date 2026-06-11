import type { UserProfile } from "#db";
import type { ShopItem } from "./schema.ts";

export class ShopStore {
  private _fileName: string;
  private _items: ShopItem[] = [];

  constructor(itemsFile: string) {
    this._fileName = itemsFile;
  }

  /**
   * Load achievements from the data file.
   */
  async load() {
    this._items = (await import(import.meta.resolve(this._fileName))).default;
  }

  /**
   * Reloads items from the data file.
   */
  async reload() {
    this._items = (await import(`${import.meta.resolve(this._fileName)}?a=${Math.random()}`));
  }

  /**
   * Returns a shop item by its ID.
   */
  get(id: string): ShopItem | undefined {
    return this._items.find(item => item.id === id);
  }

  /**
   * All shop items.
   */
  get items(): ShopItem[] {
    return this._items;
  }

  /**
   * Purchases a shop item, if the player can afford it.
   */
  purchase(itemId: string, user: UserProfile): boolean {
    const item = this.get(itemId);
    if (!item) return false;
    if (item.cost > user.tokens) return false;
    if (user.shopItems.includes(itemId)) return false;

    if (!item.rebuyable) user.shopItems.push(item.id);
    user.tokens -= item.cost;
    return true;
  }
}
