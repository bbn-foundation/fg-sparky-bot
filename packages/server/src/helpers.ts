/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Difficulties, Rarities } from "@fg-sparky/utils";
import { UserProfile } from "./users/user-profile.ts";

export function randomDifficulty(): Difficulties {
  if (Math.random() * 60 < 1) return "legendary";

  return (["easy", "medium", "hard"] as const)[Math.floor(Math.random() * 3)]!;
}

export function randomRarity(): Rarities {
  return (["common", "rare", "epic"] as const)[Math.floor(Math.random() * 3)]!;
}

export async function getUser(id: string, guildId: string): Promise<UserProfile | null> {
  return await UserProfile.findOneBy({
    id,
    guildId,
  });
}

export async function createUser(id: string, guildId: string): Promise<UserProfile> {
  const user = new UserProfile();
  user.id = id;
  user.guildId = guildId;
  await user.save();
  return user;
}
