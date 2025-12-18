/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { UserProfile } from "../entities/user-profile";

/**
 * Format of the achievement ID.
 */
export type AchievementID = `${"s" | "t"}${number}`;

/**
 * Achievement context structure.
 */
// TODO: make this useful and add some props
// oxlint-disable-next-line no-empty-interface
interface AchievementContext {

}

/**
 * Structure of an achievement. The important part is the `requirement()` function
 * that takes in the current context and returns whetever the player met the
 * reqirements.
 */
interface Achievement {
  name: string;
  description: string;
  /**
   * Used only for secret achievements.
   */
  realDescription?: string | undefined;
  requirement(user: UserProfile, ctx: AchievementContext): boolean;
}

/**
 * Object of achivements that the player can earn.
 */
export const Achievements: Record<AchievementID, Achievement> = {
  s1: {
    name: "omni oridnal",
    description: "omni oridnal",
    realDescription: `Guess "omni oridnal" when the bot generates "Omni Ordinals".`,
    requirement(): boolean {
      /* handler built-in */
      return true;
    },
  },
};

export const AchievementsArray = Object.keys(Achievements) as (keyof typeof Achievements)[];
