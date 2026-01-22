import { NumberhumanData, type UserProfile } from "#db";
import type { NumberhumanStore } from "#stores-types";
import { NumberhumanSortingOrder } from "./sorting.ts";

export async function getNumberhumansBy(
  sorting: NumberhumanSortingOrder,
  user: UserProfile,
  store: NumberhumanStore,
): Promise<NumberhumanData[]> {
  const numberhumans = await NumberhumanData.find({
    relations: {
      caughtBy: true,
    },
    where: {
      caughtBy: {
        id: user.id,
        guildId: user.guildId,
      },
    },
    order: {
      catchId: "DESC",
    },
  });

  switch (sorting) {
    case NumberhumanSortingOrder.ByHealth: {
      return numberhumans.toSorted((a, b) => a.totalHP(store) - b.totalHP(store));
    }
    case NumberhumanSortingOrder.ByAttack: {
      return numberhumans.toSorted((a, b) => a.totalAtk(store) - b.totalAtk(store));
    }
    case NumberhumanSortingOrder.ByCatchId: {
      // already sorted
      return numberhumans;
    }
    case NumberhumanSortingOrder.ByEvolution: {
      return numberhumans.toSorted((a, b) => {
        if (a.evolution > b.evolution) return 1;
        if (a.evolution < b.evolution) return -1;
        return 0;
      });
    }
    case NumberhumanSortingOrder.ByLevel: {
      return numberhumans.toSorted((a, b) => a.level - b.level);
    }
  }
}
