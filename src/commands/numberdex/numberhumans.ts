import { type UserProfile, UsersDB, type NumberhumanData } from "#db";
import { EvolutionIntegerMap } from "#numberdex/evolutions.ts";
import type { NumberhumanStore } from "#stores-types";
import { NumberhumanSortingOrder } from "./sorting.ts";

export async function getNumberhumansBy(
  sorting: NumberhumanSortingOrder,
  user: UserProfile,
  store: NumberhumanStore,
): Promise<NumberhumanData[]> {
  const numberhumans = await UsersDB.query.numberhumans.findMany({
    where: {
      caughtById: user.id,
      caughtByGuildId: user.guildId,
    },
    orderBy: {
      catchId: "asc",
    },
  });

  switch (sorting) {
    case NumberhumanSortingOrder.ByHealth: {
      return numberhumans.toSorted(
        (a, b) => b.totalHP(store) - a.totalHP(store),
      );
    }
    case NumberhumanSortingOrder.ByAttack: {
      return numberhumans.toSorted(
        (a, b) => b.totalAtk(store) - a.totalAtk(store),
      );
    }
    case NumberhumanSortingOrder.ByCatchId: {
      // already sorted
      return numberhumans;
    }
    case NumberhumanSortingOrder.ByEvolution: {
      return numberhumans.toSorted(
        (a, b) =>
          EvolutionIntegerMap[b.evolution] - EvolutionIntegerMap[a.evolution],
      );
    }
    case NumberhumanSortingOrder.ByLevel: {
      return numberhumans.toSorted((a, b) => b.level - a.level);
    }
  }
}
