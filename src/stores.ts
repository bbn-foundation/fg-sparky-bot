/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { NumberhumanStore, NumberStore, ResponseStore } from "./stores/index.ts";

export const Numbers: NumberStore = new NumberStore("numbers/numbers.json");
export const Numberhumans: NumberhumanStore = new NumberhumanStore("numbers/numberhumans.json");
export const Responses: ResponseStore = new ResponseStore("numbers/responses.json");
