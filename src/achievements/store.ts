import { Logger } from "#utils/logger.ts";
import { readdir } from "node:fs/promises";
import type { Achievement } from "./types.ts";

let reloadCount = 0;

export class Achievements {
  constructor(readonly folder: string, loadImmediately = true) {
    if (loadImmediately) void this.load();
  }
  async load(): Promise<readonly Achievement[]> {
    if (!client.isReady()) return [];

    Logger.notice(`Searching for achievements...`);
    const achievementFiles = await readdir(
      Bun.fileURLToPath(import.meta.resolve(achievementsFolder, import.meta.url)),
      {
        withFileTypes: true,
      },
    );

    const achievements: readonly Achievement[] = await Promise.all(
      achievementFiles.filter(entry => entry.isFile() && entry.name.endsWith(".ts"))
        .map(entry => entry.name)
        // oxlint-disable-next-line typescript/no-unsafe-return, no-unsafe-member-access
        .map(async (src) => (await import(`${achievementsFolder}/${src}?count=${reloadCount++}`)).default),
    );

    Logger.info(`Loading ${achievements.length.toString()} achievements (which are: %s)`, achievements.map(cmd => cmd.name));
    return achievements;
  },
};
