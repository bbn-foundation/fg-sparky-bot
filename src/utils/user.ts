/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { UserProfile } from "../entities/user-profile";

export async function getUser(id: string): Promise<UserProfile | null> {
  return await UserProfile.findOneBy({
    id,
  });
}

export async function createUser(id: string): Promise<UserProfile> {
  const user = new UserProfile();
  user.id = id;
  await user.save();
  return user;
}
