import type { NumberhumanData, UserProfile } from "#db";

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
  /**
   * Invoking a command.
   */
  CommandInvocation = "CommandInvocation",
}

/**
 * The context of an achievement when calling the .requirement() function.
 */
export interface AchievementContext {
  /**
   * The person's user profile.
   */
  profile: UserProfile;
  /**
   * The numberhuman that has been caught.
   */
  numberhuman?: NumberhumanData;
  /**
   * Their guess.
   */
  userGuess: string;
  /**
   * The correct answer.
   */
  correctGuess: string;
  /**
   * The achievement trigger.
   */
  trigger: AchievementTrigger;
}

/**
 * Structure of an achievement. The important part is the `requirement()` function
 * that takes in the current context and returns whetever the player met the
 * reqirements.
 */
export interface Achievement {
  /**
   * The achievement's ID.
   */
  id: AchievementID;
  /**
   * Name of the achievement that will be shown to the user
   */
  name: string;
  /**
   * The description that will be shown to the user.
   */
  description: string;
  /**
   * The actual description of the achievement. Only used for secret achievements.
   */
  realDescription?: string | undefined;
  /**
   * On which event should we check the achievement.
   * You may use bitshift OR (eg. EventA | EventB) to trigger on multiple events.
   */
  triggerEvent: AchievementTrigger;
  /**
   * The main function which checks the context around the user to determine
   * whether or not to give the achievement.
   * @param ctx THe context provided to the achievement validator.
   */
  requirement(ctx: AchievementContext): boolean;
}
