import type { NumberhumanStore } from "#stores-types";
import { numberhumans, userProfiles } from "./schema";
import { UsersDB } from "./users-db";

export type UserProfile = typeof userProfiles.$inferSelect;
export type NumberhumanData = typeof numberhumans.$inferSelect;

export function getUser(id: string, guildId: string) {
  return UsersDB.query.userProfiles.findFirst({
    where: {
      id,
      guildId,
    },
  });
}

export function createUser(id: string, guildId: string) {
  return UsersDB.insert(userProfiles)
    .values({
      id,
      guildId,
    })
    .returning();
}

export function totalStatsOf(number: NumberhumanData, store: NumberhumanStore): [number, number] {
  const baseData = store.get(number.id).expect("the numberhuman should be in the store");
  return [number.]
}
