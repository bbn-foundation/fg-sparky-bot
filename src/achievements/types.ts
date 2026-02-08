import type { NumberhumanData, UserProfile } from "#db";
import type { NumberhumanInfo } from "#stores-types";
import type { StoredNumberInfo } from "#utils/types";

/**
 * Format of the achievement ID.
 * s - secret achievement
 * t - token-related achievements
 * u - unique achievements
 */
export type AchievementID = `${"s" | "t" | "u"}${number}`;

/**
 * A possible trigger for the achievement.
 */
export enum AchievementTrigger {
  /**
   * Guessing an FG sparky entry.
   */
  SparkyGuess = "SparkyGuess",
  /**
   * Guessing a Numberdex entry.
   */
  NumberdexGuess = "NumberdexGuess",
}

/**
 * The context for an achievement that was triggered after
 * an FG sparky guess.
 */
interface AchievementSparkyContext {
  /**
   * The person's user profile.
   */
  profile: UserProfile;
  /**
   * What they guessed.
   */
  userGuess: string;
  /**
   * Number information for the correct answer.
   */
  number: StoredNumberInfo;
}

/**
 * The context for an achievement that was triggered after a numberhuman catch.
 */
interface AchievementCatchContext {
  /**
   * The person's user profile.
   */
  profile: UserProfile;
  /**
   * The numberhuman the person caught.
   */
  numberhuman: NumberhumanData;
  /**
   * The data of the numberhuman they've caught.
   */
  number: NumberhumanInfo;
}

interface AchievementBase {
  id: `${"u" | "t" | "s"}${number}`;
  name: string;
  description: string;
}

interface SparkyAchievement extends AchievementBase {
  trigger: AchievementTrigger.SparkyGuess;
  requirement(ctx: AchievementSparkyContext): boolean;
}

interface NumberdexAchievement extends AchievementBase {
  trigger: AchievementTrigger.NumberdexGuess;
  requirement(ctx: AchievementCatchContext): boolean;
}

export type Achievement = SparkyAchievement | NumberdexAchievement;
