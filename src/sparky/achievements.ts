/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { NumberhumanData, UserProfile } from "#db";
import type { ReadonlyDeep } from "#utils/types.ts";

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
  SparkyGuess = 1,
  /**
   * Guessing a Numberdex entry.
   */
  NumberdexGuess = 2,
  /**
   * Invoking a command.
   */
  CommandInvocation = 4,
}

/**
 * The context of an achievement when calling the .requirement() function.
 */
interface AchievementContext {
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
interface Achievement {
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

/**
 * Object of achivements that the player can earn.
 */
export const Achievements: ReadonlyDeep<Record<AchievementID, Achievement>> = {
  s1: {
    name: "omni oridnal",
    description: "omni oridnal",
    triggerEvent: AchievementTrigger.SparkyGuess | AchievementTrigger.NumberdexGuess,
    requirement(ctx: AchievementContext): boolean {
      if (/omni oridnal/gimu.test(ctx.userGuess)) return true;
      return false;
    },
  },
};
