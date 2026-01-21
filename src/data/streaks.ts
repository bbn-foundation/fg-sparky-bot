import { Collection, getGainFromDifficulty, Logger } from "@fg-sparky/utils";
import { getUser } from "./helpers.ts";

export class StreakCollection extends Collection<string, number> {
  appendStreak(id: string, guildId: string): this {
    // just checked if the key exists

    if (this.has(`${id}.${guildId}`)) {
      return this.set(`${id}.${guildId}`, this.get(`${id}.${guildId}`)! + 1);
    }
    return this.set(`${id}.${guildId}`, 1);
  }

  resetStreak(id: string, guildId: string): this {
    this.delete(`${id}.${guildId}`);
    return this;
  }

  getTokenGain(
    userId: string,
    guildId: string,
    difficulty: "easy" | "medium" | "hard" | "legendary",
  ): number {
    let streakGain = 1 + (this.get(`${userId}.${guildId}`) ?? 0) / 10;
    if (streakGain > 1.5) streakGain = Math.min(Math.sqrt(streakGain / 1.5) * 1.5, 3);
    return Math.round(getGainFromDifficulty(difficulty) * streakGain);
  }

  override async clear(): Promise<void> {
    Logger.info("saving player's best streaks into database");
    await Promise.all(
      this.map(async (streak, id) => {
        const user = await getUser(id.split(".")[0]!, id.split(".")[1]!);
        if (!user) return;

        user.bestStreak = Math.max(user.bestStreak, streak);
        return user.save();
      }),
      // oxlint-disable-next-line promise/always-return
    ).then(() => {
      super.clear();
    });
  }
}
