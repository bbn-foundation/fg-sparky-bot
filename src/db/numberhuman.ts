/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { EvolutionType } from "#numberdex/evolutions.ts";
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const numberhumans = sqliteTable("numberhuman", {
  catchId: int().primaryKey({ autoIncrement: true }),
  id: text(),
  ability: text(),
  bonusHP: real().default(1),
  bonusAtk: real().default(1),
  level: int().default(0),
  evolution: text().$type<EvolutionType>(),
});
