import type { EvolutionType } from "#numberdex/evolutions";
import { defineRelations } from "drizzle-orm";
import {
  sqliteTable,
  real,
  text,
  int,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const numberhumans = sqliteTable("numberhuman", {
  catchId: int().primaryKey({ autoIncrement: true }),
  id: text(),
  ability: text(),
  bonusHP: real().default(1),
  bonusAtk: real().default(1),
  level: int().default(0),
  evolution: text().$type<EvolutionType>(),
  caughtById: text().references(() => userProfiles.id),
  caughtByGuildId: text().references(() => userProfiles.guildId),
});

export const userProfiles = sqliteTable(
  "user_profiles",
  {
    id: text().primaryKey(),
    guildId: text().primaryKey(),
    tokens: int().default(0),
    guessedEntries: text({ mode: "json" }).$type<string[]>().default([]),
    uniqueGuessed: text({ mode: "json" }).$type<string[]>().default([]),
    numberhumansGuessed: text({ mode: "json" }).$type<string[]>().default([]),
    numberhumansGuessedUnique: text({ mode: "json" })
      .$type<string[]>()
      .default([]),
    bestStreak: int().default(0),
  },
  (table) => [
    primaryKey({
      columns: [table.id, table.guildId],
    }),
  ],
);

export const relations = defineRelations(
  {
    numberhumans,
    userProfiles,
  },
  (r) => ({
    userProfiles: {
      caught: r.many.numberhumans(),
    },
    numberhumans: {
      caughtBy: r.one.userProfiles({
        from: [r.numberhumans.caughtById, r.numberhumans.caughtByGuildId],
        to: [r.userProfiles.id, r.userProfiles.guildId],
      }),
    },
  }),
);
