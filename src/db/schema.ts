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
  bonusHP: real().notNull().default(1),
  bonusAtk: real().notNull().default(1),
  level: int().notNull().default(0),
  evolution: text().notNull().$type<EvolutionType>(),
  caughtById: text()
    .notNull()
    .references(() => userProfiles.id),
  caughtByGuildId: text()
    .notNull()
    .references(() => userProfiles.guildId),
});

export const userProfiles = sqliteTable(
  "user_profiles",
  {
    id: text().primaryKey(),
    guildId: text().primaryKey(),
    tokens: int().notNull().default(0),
    guessedEntries: text({ mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    uniqueGuessed: text({ mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    numberhumansGuessed: text({ mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    numberhumansGuessedUnique: text({ mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    bestStreak: int().notNull().default(0),
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
