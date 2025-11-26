/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import Guess from "./guess.ts";
import Hello from "./hello.ts";
import type { Command } from "./types.ts";
import User from "./users.ts";

export const Commands: readonly Command[] = [Hello, Guess, User];
