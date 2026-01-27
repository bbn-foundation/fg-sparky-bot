/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ReadonlyDeep } from "type-fest";

/**
 * Object of achivements that the player can earn.
 */
export const Achievements: ReadonlyDeep<{
  _achs: Array<Achievement>;
  check(ctx: AchievementContext): boolean;
}> = {
  _achs: [{
    id: "s1",
    name: "omni oridnal",
    description: "omni oridnal",
    triggerEvent: AchievementTrigger.SparkyGuess | AchievementTrigger.NumberdexGuess,
    requirement(ctx: AchievementContext): boolean {
      if (/omni oridnal/gimu.test(ctx.userGuess)) return true;
      return false;
    },
  }],
  check(ctx: AchievementContext): boolean {
    for (const ach of this._achs) {
      if (ach.requirement(ctx)) return true;
    }
    return false;
  },
};
