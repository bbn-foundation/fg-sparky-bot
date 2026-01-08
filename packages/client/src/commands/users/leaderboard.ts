import { UserProfile } from "@fg-sparky/server";
import { formatPercent, Logger, ordinalOf, type ServerSlashCommandInteraction } from "@fg-sparky/utils";
import type { Client, User as DiscordUser } from "discord.js";
import { Numbers } from "../../stores.ts";

export enum LeaderboardDisplayType {
  Tokens = "tokens",
  TotalEntries = "total-entries",
  UniqueEntries = "unique-entries",
}

async function getProfilesByType(
  leaderboardType: LeaderboardDisplayType,
  guildId: string,
  amount: number,
): Promise<UserProfile[]> {
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
      return profiles.toSorted((a, b) => b.guessedEntries.length - a.guessedEntries.length).slice(0, amount);
    }
    case LeaderboardDisplayType.UniqueEntries: {
      const profiles = await UserProfile.find({
        select: ["id", "uniqueGuessed"],
        where: { guildId },
      });
      return profiles.toSorted((a, b) => b.uniqueGuessed.length - a.uniqueGuessed.length).slice(0, amount);
    }
  }
}

export async function userLeaderboardDisplay(client: Client, interaction: ServerSlashCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const displayAmount = (interaction.options.getNumber("amount", false) ?? 10);
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
    users.map(async profile => await client.users.fetch(profile.id)),
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
    }
  })();
  const content = `\
    # User leaderboard for ${leaderboardHeader}: \n \
    ${users.map((user, index) => {
      // oxlint-disable-next-line array-callback-return: all paths always returns
      if (index > Math.min(displayAmount, 25) - 1) return "no";
      const position = ordinalOf(index + 1);
      // Sometimes an IIFE looks better then chaining ternaries
      const header = ((index) => {
        if (index === 0) return "##";
        if (index === 1) return "###";
        return "";
      })(index);
      switch (leaderboardType) {
        case LeaderboardDisplayType.Tokens: {
          return `${header} ${position}: ${discordUsers[index]!.displayName} (${user.tokens.toString()} <:terminusfinity:1444859277515690075>)`;
        }
        case LeaderboardDisplayType.TotalEntries: {
          return `${header} ${position}: ${discordUsers[index]!.displayName} (${user.guessedEntries.length.toString()} entries)`;
        }
        case LeaderboardDisplayType.UniqueEntries: {
          return `${header} ${position}: ${discordUsers[index]!.displayName} (${user.uniqueGuessed.length.toString()} entries) [${formatPercent(user.uniqueGuessed.length / Numbers.UNIQUE_ENTRIES)}]`;
        }
      }
    }).filter(value => value !== "no").join("\n")}
    `;
  await interaction.editReply({ content });

  if (users.length > 25 && displayAmount > 25) {
    Logger.debug("/user-leaderboard: generating extended user reply...");
    const content = `\
    # User leaderboard (cont.): \n \
    ${users.slice(25).map((user, index) => {
      if (index > displayAmount - 25) return "no";
      const position = ordinalOf(index + 26);
      // Sometimes an IIFE looks better then chaining ternaries
      const header = ((index) => {
        if (index === 0) return "##";
        if (index === 1) return "###";
        return "";
      })(index);
      return `${header} ${position}: ${discordUsers[index + 25]!.displayName} (${user.tokens.toString()} <:terminusfinity:1444859277515690075>)`;
    }).filter(value => value !== "no").join("\n")}
    `;

    await interaction.followUp({ content });
  }
}
