/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EvolutionType } from "#numberdex/evolutions.ts";
import type { NumberhumanInfo } from "#stores-types";
import { Logger } from "#utils/logger.ts";
import { getRandomInt } from "#utils/numbers.ts";
import { NumberhumanData } from "./numberhuman.ts";
import { UserProfile } from "./user-profile.ts";

export async function getUser(id: string, guildId: string): Promise<UserProfile | null> {
  return UserProfile.findOneBy({
    id,
    guildId,
  });
}

export function createUser(id: string, guildId: string): UserProfile {
  const user = new UserProfile();
  user.id = id;
  user.guildId = guildId;
  return user;
}

export function createNumberhuman(
  options: NumberhumanCreationOptions,
): NumberhumanData {
  const newHuman = new NumberhumanData();
  newHuman.bonusAtk = options.bonusATK;
  newHuman.bonusHP = options.bonusHP;
  newHuman.id = options.base.uuid;
  newHuman.evolution = randomEvolution();
  return newHuman;
}

interface NumberhumanCreationOptions {
  base: NumberhumanInfo;
  bonusHP: number;
  bonusATK: number;
}

const EvolutionRarity: [EvolutionType, number][] = [
  [EvolutionType.Absolute, 500],
  [EvolutionType.Corrupt, 400],
  [EvolutionType.Transcendent, 300],
  [EvolutionType.Zyrolexic, 200],
  [EvolutionType.Subeuclidean, 175],
  [EvolutionType.Corrotechnic, 125],
  [EvolutionType.Eternal, 90],
  [EvolutionType.Celestial, 48],
  [EvolutionType.Endfimidian, 25],
  [EvolutionType.Mastered, 16],
  [EvolutionType.Superscaled, 8],
  [EvolutionType.None, 1],
];

function randomEvolution(): EvolutionType {
  for (const [evol, rarity] of EvolutionRarity) {
    const randomInt = getRandomInt(1, rarity);
    Logger.debug(
      `checking for evolution ${evol} (within a 1 in ${rarity} chance, got ${randomInt})`,
    );
    if (randomInt === rarity) return evol;
  }
  Logger.debug("couldn't get any");
  return EvolutionType.None;
}
