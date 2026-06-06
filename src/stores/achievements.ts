import type { UserProfile } from "#db";
import type { Achievement, ACHIEVEMENT_EVENT, ACHIEVEMENT_EVENT_DATA } from "./schema.ts";

export class AchievementStore {
  private _fileName: string;
  private _achievements: Achievement[] = [];

  constructor(achsFile: string) {
    this._fileName = achsFile;
  }

  /**
   * Load achievements from the data file.
   */
  async load() {
    this._achievements = (await import(import.meta.resolve(this._fileName))).default;
  }

  /**
   * Reloads achievements from the data file.
   */
  async reload() {
    this._achievements = (await import(`${import.meta.resolve(this._fileName)}?a=${Math.random()}`));
  }

  /**
   * Checks that all achievements registered to handle a specific event
   * and its requirement was satisifed.
   * Returns the ID of achievements that could be unlocked.
   */
  check<Event extends ACHIEVEMENT_EVENT>(event: Event, user: UserProfile, specificData: ACHIEVEMENT_EVENT_DATA[Event]): string[] | null {
    const unlockable = [];
    for (const ach of this._achievements) {
      if (ach.event === event && ach.check(specificData) && !user.achievements.includes(ach.id)) unlockable.push(ach.id);
    }
    return unlockable.length === 0 ? null : unlockable;
  }

  /**
   * Returns the achievement information with the achievement ID.
   */
  get(id: string): Achievement | undefined {
    return this._achievements.find(ach => ach.id === id);
  }
}
