import { UserProfile,NumberhumanData } from "#db";
import { filterUniqueObjects } from "#utils/array.ts";
import { Numberhumans } from "../../stores.ts";
import { LeaderboardDisplayType } from "./leaderboard.ts";

export async function getProfilesByType(
  leaderboardType: LeaderboardDisplayType,
  guildId: string,
): Promise<NumberhumanData[] | UserProfile[]> {
  switch (leaderboardType) {
    case LeaderboardDisplayType.Tokens: {
      return await UserProfile.find({
        order: { tokens: "DESC" },
        select: { id: true, tokens: true },
        where: { guildId },
      });
    }
    case LeaderboardDisplayType.TotalEntries: {
      const profiles = await UserProfile.find({
        select: { id: true, guessedEntries: true },
        where: { guildId },
      });
      return profiles
        .toSorted((a, b) => b.guessedEntries.length - a.guessedEntries.length);
    }
    case LeaderboardDisplayType.UniqueEntries: {
      const profiles = await UserProfile.find({
        select: { id: true, uniqueGuessed: true },
        where: { guildId },
      });
      return profiles
        .toSorted((a, b) => b.uniqueGuessed.length - a.uniqueGuessed.length);
    }

    case LeaderboardDisplayType.TotalNumberhumans: {
      const profiles = await UserProfile.find({
        select: { id: true, numberhumansGuessed: true },
        where: { guildId },
      });

      return profiles.toSorted((a, b) => b.numberhumansGuessed.length - a.numberhumansGuessed.length);
    }
    case LeaderboardDisplayType.UniqueNumberhumans: {
      const profiles = await UserProfile.find({
        select: { id: true, numberhumansGuessedUnique: true },
        where: { guildId },
      });

      return profiles.toSorted((a, b) => b.numberhumansGuessedUnique.length - a.numberhumansGuessedUnique.length);
    }
    case LeaderboardDisplayType.BestNumberhuman: {
      const numberhumans = await NumberhumanData.find({
        where: {
          caughtBy: {
            guildId,
          },
        },
        relations: {
          caughtBy: true,
        },
      });
      return numberhumans.toSorted((a, b) =>
        (b.totalHP(Numberhumans) + b.totalAtk(Numberhumans))
        - (a.totalHP(Numberhumans) + a.totalAtk(Numberhumans))
      ).filter((value, index, array) => array.findIndex(v => v.caughtBy!.id === value.caughtBy!.id) === index);
    }

    case LeaderboardDisplayType.HighestStreak: {
      return await UserProfile.find({
        order: { bestStreak: "DESC" },
        select: { id: true, bestStreak: true },
        where: { guildId },
      });
    }
  }
}


export async function getGlobalProfilesByType(
  leaderboardType: LeaderboardDisplayType,
): Promise<NumberhumanData[] | UserProfile[]> {
  switch (leaderboardType) {
    case LeaderboardDisplayType.Tokens: {
      const profiles = await UserProfile.find({
        order: { tokens: "DESC" },
        select: { id: true, tokens: true },
      });

      return filterUniqueObjects(profiles, "id");
    }
    case LeaderboardDisplayType.TotalEntries: {
      const profiles = await UserProfile.find({
        select: { id: true, guessedEntries: true },
      });
      return filterUniqueObjects(profiles
        .toSorted((a, b) => b.guessedEntries.length - a.guessedEntries.length),
      "id");
    }
    case LeaderboardDisplayType.UniqueEntries: {
      const profiles = await UserProfile.find({
        select: { id: true, uniqueGuessed: true }
      });
      return filterUniqueObjects(profiles
        .toSorted((a, b) => b.uniqueGuessed.length - a.uniqueGuessed.length),
        "id"
      );
    }

    case LeaderboardDisplayType.TotalNumberhumans: {
      const profiles = await UserProfile.find({
        select: { id: true, numberhumansGuessed: true },
      });

      return filterUniqueObjects(
        profiles.toSorted((a, b) => b.numberhumansGuessed.length - a.numberhumansGuessed.length),
        "id"
      );
    }
    case LeaderboardDisplayType.UniqueNumberhumans: {
      const profiles = await UserProfile.find({
        select: { id: true, numberhumansGuessedUnique: true },
      });

      return filterUniqueObjects(
        profiles.toSorted((a, b) => b.numberhumansGuessedUnique.length - a.numberhumansGuessedUnique.length),
        "id"
      );
    }
    case LeaderboardDisplayType.BestNumberhuman: {
      const numberhumans = await NumberhumanData.find({
        relations: {
          caughtBy: true,
        },
      });
      return numberhumans.toSorted((a, b) =>
        (b.totalHP(Numberhumans) + b.totalAtk(Numberhumans))
        - (a.totalHP(Numberhumans) + a.totalAtk(Numberhumans))
      ).filter((value, index, array) => array.findIndex(v => v.caughtBy!.id === value.caughtBy!.id) === index);
    }

    case LeaderboardDisplayType.HighestStreak: {
      return filterUniqueObjects(await UserProfile.find({
        order: { bestStreak: "DESC" },
        select: { id: true, bestStreak: true },
      }), "id");
    }
  }
}
