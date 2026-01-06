/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
*/
import { NumberhumanStore, NumberStore } from "@fg-sparky/server";

export const Numbers: NumberStore = NumberStore.create("numbers/numbers.json");
export const Numberhumans: NumberhumanStore = NumberhumanStore.create();
