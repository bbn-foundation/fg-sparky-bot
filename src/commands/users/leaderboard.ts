import { NumberhumanData, UserProfile } from "#db";
import { EvolutionType } from "#numberdex/evolutions.ts";
import { Numberhumans, Numbers } from "#stores";
import { formatPercent } from "#utils/formatter.ts";
import { Logger } from "#utils/logger.ts";
import { ordinalOf } from "#utils/numbers.ts";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { italic, type Client, type User as DiscordUser } from "discord.js";
import { getGlobalProfilesByType, getProfilesByType } from "./get-profiles.ts";

export enum LeaderboardDisplayType {
  Tokens = "tokens",
  TotalEntries = "total-entries",
  UniqueEntries = "unique-entries",
  TotalNumberhumans = "total-numberhumans",
  UniqueNumberhumans = "unique-numberhumans",
  BestNumberhuman = "best-numberhuman",
  HighestStreak = "highest-streak",
}

export async function userLeaderboardDisplay(
  client: Client,
  interaction: ServerSlashCommandInteraction,
): Promise<void> {
  await interaction.deferReply();

  const global = interaction.options.getBoolean("global") ?? false;
  const leaderboardChunk = 15;
  // oxlint-disable-next-line no-unsafe-type-assertion: guarantened to be one of the types because of the discord api
  const leaderboardType = interaction.options.getString("type", true) as LeaderboardDisplayType;

  Logger.info("/user-leaderboard: fetching user data...");

  // Only take displayAmount from db to avoid fetching too many people and
  // getting rate-limited by discord
  console.time("/user-leaderboard: fetch user data from db");
  const users = (global
    ? await getGlobalProfilesByType(leaderboardType)
    : await getProfilesByType(leaderboardType, interaction.guildId)
  );
  console.timeEnd("/user-leaderboard: fetch user data from db");

  console.time("/user-leaderboard: fetch user data from discord");
  const discordUsers: DiscordUser[] = await Promise.all(
    users.map((profile) =>
      profile instanceof NumberhumanData
        ? client.users.fetch(profile.caughtBy!.id)
        : client.users.fetch(profile.id)
    ),
  );
  console.timeEnd("/user-leaderboard: fetch user data from discord");

  Logger.debug("/user-leaderboard: generating user reply...");
  const leaderboardHeader = (() => {
    const globalIndicator = global ? "[global]" : "[server]";
    switch (leaderboardType) {
      case LeaderboardDisplayType.Tokens: {
        return `Terminus Tokens ${globalIndicator}`;
      }
      case LeaderboardDisplayType.TotalEntries: {
        return `total entries ${globalIndicator}`;
      }
      case LeaderboardDisplayType.UniqueEntries: {
        return `unique entries ${globalIndicator}`;
      }
      case LeaderboardDisplayType.TotalNumberhumans: {
        return `total numberhuman catches ${globalIndicator}`;
      }
      case LeaderboardDisplayType.UniqueNumberhumans: {
        return `unique numberhuman catches ${globalIndicator}`;
      }
      case LeaderboardDisplayType.BestNumberhuman: {
        return `best numberhuman (by HP + ATK) ${globalIndicator}`;
      }
      case LeaderboardDisplayType.HighestStreak: {
        return `highest streaks ${globalIndicator}`;
      }
    }
  })();

  const paginatedContent = new PaginatedMessage();

  for (let i = 0; i < users.length; i += leaderboardChunk) {
    const chunk = users.slice(i, i + leaderboardChunk).map((user, preIndex) => {
      const index = preIndex + i;
      const position = ordinalOf(index + 1);
      // Sometimes an IIFE looks better then chaining ternaries
      const header = ((index) => {
        if (index % leaderboardChunk === 0) return "##";
        if (index % leaderboardChunk === 1) return "###";
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

      switch (leaderboardType) {
        case LeaderboardDisplayType.Tokens: {
          return `${template} (${user.tokens.toString()} <:terminusfinity:1444859277515690075>)`;
        }
        case LeaderboardDisplayType.TotalEntries: {
          return `${template} (${user.guessedEntries.length.toString()} entries)`;
        }
        case LeaderboardDisplayType.UniqueEntries: {
          return `${template} (${user.uniqueGuessed.length.toString()} entries) [${formatPercent(user.uniqueGuessed.length / Numbers.UNIQUE_ENTRIES)
            }]`;
        }
        case LeaderboardDisplayType.TotalNumberhumans: {
          return `${template} (${user.numberhumansGuessed.length} entries)`;
        }
        case LeaderboardDisplayType.UniqueNumberhumans: {
          return `${template} (${user.numberhumansGuessedUnique.length} entries) [${formatPercent(user.numberhumansGuessedUnique.length / Numberhumans.UNIQUE_ENTRIES)
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
    });
    paginatedContent.addPage({
      content: `\
      # User leaderboard for ${leaderboardHeader}: \n\
      ${chunk.join("\n")}
      `
    })
  }

  paginatedContent.run(interaction);
}
