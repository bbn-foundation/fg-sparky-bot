/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { Command } from "#utils/types.ts";
import { Poweroff, Restart } from "./bot-management.ts";
import Gift from "./gift.ts";
import Guess from "./guess.ts";
import Hello from "./hello.ts";
import Numberdex from "./numberdex.ts";
import Reload from "./reload.ts";
import User from "./users.ts";

export const Commands: readonly Command[] = [
  Hello,
  Guess,
  User,
  Poweroff,
  Restart,
  Numberdex,
  Reload,
  Gift,
];
