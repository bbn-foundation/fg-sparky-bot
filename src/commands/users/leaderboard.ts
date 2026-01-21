import { NumberhumanData, UserProfile } from "@fg-sparky/server";
import { EvolutionType, formatPercent, Logger, ordinalOf, type ServerSlashCommandInteraction } from "@fg-sparky/utils";
import { type Client, italic, type User as DiscordUser } from "discord.js";
import { Numberhumans, Numbers } from "../../stores.ts";

export enum LeaderboardDisplayType {
  Tokens = "tokens",
  TotalEntries = "total-entries",
  UniqueEntries = "unique-entries",
  TotalNumberhumans = "total-numberhumans",
  UniqueNumberhumans = "unique-numberhumans",
  BestNumberhuman = "best-numberhuman",
  HighestStreak = "highest-streak",
}

async function getProfilesByType(
  leaderboardType: LeaderboardDisplayType,
  guildId: string,
  amount: number,
): Promise<NumberhumanData[] | UserProfile[]> {
  switch (leaderboardType) {
    case LeaderboardDisplayType.Tokens: {
      return await UserProfile.find({
        order: { tokens: "DESC" },
        select: ["id", "tokens"],
        where: { guildId },
        take: amount,
      });
    }
    case LeaderboardDisplayType.TotalEntries: {
      const profiles = await UserProfile.find({
        select: ["id", "guessedEntries"],
        where: { guildId },
      });
      return profiles
        .toSorted((a, b) => b.guessedEntries.length - a.guessedEntries.length)
        .slice(0, amount);
    }
    case LeaderboardDisplayType.UniqueEntries: {
      const profiles = await UserProfile.find({
        select: ["id", "uniqueGuessed"],
        where: { guildId },
      });
      return profiles
        .toSorted((a, b) => b.uniqueGuessed.length - a.uniqueGuessed.length)
        .slice(0, amount);
    }

    case LeaderboardDisplayType.TotalNumberhumans: {
      const profiles = await UserProfile.find({
        select: ["id", "numberhumansGuessed"],
        where: { guildId },
      });

      return profiles.toSorted((a, b) => b.numberhumansGuessed.length - a.numberhumansGuessed.length)
        .slice(0, amount);
    }
    case LeaderboardDisplayType.UniqueNumberhumans: {
      const profiles = await UserProfile.find({
        select: ["id", "numberhumansGuessedUnique"],
        where: { guildId },
      });

      return profiles.toSorted((a, b) => b.numberhumansGuessedUnique.length - a.numberhumansGuessedUnique.length)
        .slice(0, amount);
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
      ).filter((value, index, array) => array.findIndex(v => v.caughtBy!.id === value.caughtBy!.id) === index)
        .slice(0, amount);
    }

    case LeaderboardDisplayType.HighestStreak: {
      return await UserProfile.find({
        order: { bestStreak: "DESC" },
        select: ["id", "bestStreak"],
        where: { guildId },
        take: amount,
      });
    }
  }
}

export async function userLeaderboardDisplay(
  client: Client,
  interaction: ServerSlashCommandInteraction,
): Promise<void> {
  await interaction.deferReply();

  const displayAmount = interaction.options.getNumber("amount", false) ?? 10;
  // oxlint-disable-next-line no-unsafe-type-assertion: guarantened to be one of the types because of the discord api
  const leaderboardType = interaction.options.getString("type", true) as LeaderboardDisplayType;

  Logger.info("/user-leaderboard: fetching user data...");

  // Only take displayAmount from db to avoid fetching too many people and
  // getting rate-limited by discord
  console.time("/user-leaderboard: fetch user data from db");
  const users = await getProfilesByType(leaderboardType, interaction.guildId, displayAmount);
  console.timeEnd("/user-leaderboard: fetch user data from db");

  console.time("/user-leaderboard: fetch user data from discord");
  const discordUsers: DiscordUser[] = await Promise.all(
    users.map(async (profile) =>
      profile instanceof NumberhumanData
        ? await client.users.fetch(profile.caughtBy!.id)
        : await client.users.fetch(profile.id)
    ),
  );
  console.timeEnd("/user-leaderboard: fetch user data from discord");

  Logger.debug("/user-leaderboard: generating user reply...");
  const leaderboardHeader = (() => {
    switch (leaderboardType) {
      case LeaderboardDisplayType.Tokens: {
        return "Terminus Tokens";
      }
      case LeaderboardDisplayType.TotalEntries: {
        return "total entries";
      }
      case LeaderboardDisplayType.UniqueEntries: {
        return "unique entries";
      }
      case LeaderboardDisplayType.TotalNumberhumans: {
        return "total numberhuman catches";
      }
      case LeaderboardDisplayType.UniqueNumberhumans: {
        return "unique numberhuman catches";
      }
      case LeaderboardDisplayType.BestNumberhuman: {
        return "best numberhuman (by HP + ATK)";
      }
      case LeaderboardDisplayType.HighestStreak: {
        return "highest streaks";
      }
    }
  })();
  const content = `\
    # User leaderboard for ${leaderboardHeader}: \n \
    ${
    users
      .map((user, index) => {
        if (index > Math.min(displayAmount, 25) - 1) return "no";
        const position = ordinalOf(index + 1);
        // Sometimes an IIFE looks better then chaining ternaries
        const header = ((index) => {
          if (index === 0) return "##";
          if (index === 1) return "###";
          return "";
        })(index);
        const template = `${header} ${position}: ${discordUsers[index]!.displayName}`;
        if (user instanceof NumberhumanData) {
          // above condition is always true when someone wants to see the best numberhumans
          // and always false otherwise (see getProfilesByType)
          const numberInStore = Numberhumans.get(user.id)
            .expect("for the numberhuman to exist");
          const stats = `${user.totalHP(Numberhumans).toFixed(2)} HP, ${user.totalAtk(Numberhumans).toFixed(2)} ATK`;
          const toDisplay = user.evolution === EvolutionType.None
            ? `"${numberInStore.name}", ${stats}`
            : `${italic(user.evolution)} "${numberInStore.name}", ${stats}`;
          return `${template} (${toDisplay})`;
        }
        // oxlint-disable-next-line typescript/switch-exhaustiveness-check
        switch (leaderboardType) {
          case LeaderboardDisplayType.Tokens: {
            return `${template} (${user.tokens.toString()} <:terminusfinity:1444859277515690075>)`;
          }
          case LeaderboardDisplayType.TotalEntries: {
            return `${template} (${user.guessedEntries.length.toString()} entries)`;
          }
          case LeaderboardDisplayType.UniqueEntries: {
            return `${template} (${user.uniqueGuessed.length.toString()} entries) [${
              formatPercent(user.uniqueGuessed.length / Numbers.UNIQUE_ENTRIES)
            }]`;
          }
          case LeaderboardDisplayType.TotalNumberhumans: {
            return `${template} (${user.numberhumansGuessed.length} entries)`;
          }
          case LeaderboardDisplayType.UniqueNumberhumans: {
            return `${template} (${user.numberhumansGuessedUnique.length} entries) [${
              formatPercent(user.numberhumansGuessedUnique.length / Numberhumans.UNIQUE_ENTRIES)
            }]`;
          }
          case LeaderboardDisplayType.BestNumberhuman: {
            return "should be handled in the above condition";
          }
          case LeaderboardDisplayType.HighestStreak: {
            return `${template} (streak of ${user.bestStreak})`;
          }
          default: {
            throw new TypeError("not implemented");
          }
        }
      })
      .filter((value) => value !== "no")
      .join("\n")
  }
    `;
  await interaction.editReply({ content });

  // if (users.length > 25 && displayAmount > 25) {
  //   Logger.debug("/user-leaderboard: generating extended user reply...");
  //   const content = `\
  //   # User leaderboard (cont.): \n \
  //   ${
  //     users
  //       .slice(25)
  //       .map((user, index) => {
  //         if (index > displayAmount - 25) return "no";
  //         const position = ordinalOf(index + 26);
  //         // Sometimes an IIFE looks better then chaining ternaries
  //         const header = ((index) => {
  //           if (index === 0) return "##";
  //           if (index === 1) return "###";
  //           return "";
  //         })(index);
  //         return `${header} ${position}: ${
  //           discordUsers[index + 25]!.displayName
  //         } (${user.tokens.toString()} <:terminusfinity:1444859277515690075>)`;
  //       })
  //       .filter((value) => value !== "no")
  //       .join("\n")
  //   }
  //   `;

  //   await interaction.followUp({ content });
  // }
}
