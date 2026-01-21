import { UserProfile } from "@fg-sparky/server";
import { formatPercent, joinStringArray, type ServerSlashCommandInteraction } from "@fg-sparky/utils";
import type { Client } from "discord.js";
import { Numbers } from "../../stores.ts";

export default async function serverStatisticsDisplay(
  _: Client,
  interaction: ServerSlashCommandInteraction,
): Promise<void> {
  await interaction.deferReply();

  const users = await UserProfile.find({
    where: { guildId: interaction.guildId },
  });

  const thisServer = interaction.guild?.name ?? "(couldn't get name)";

  const uniqueAcrossUsers = users
    .flatMap((user) => user.uniqueGuessed)
    .filter((value, index, array) => array.indexOf(value) === index);
  const totalAcrossUsers = users.flatMap((user) => user.guessedEntries);

  const calculatedStatistics = {
    totalUsers: users.length.toString(),
    totalTokens: users
      .map((user) => user.tokens)
      .reduce((prev, curr) => prev + curr)
      .toString(),
    numbersGuessed: {
      total: totalAcrossUsers.length.toString(),
      unique: uniqueAcrossUsers.length.toString(),
      easy: {
        total: Numbers.countEntriesTotal("easy", totalAcrossUsers).toString(),
        unique: Numbers.countEntriesUnique("easy", uniqueAcrossUsers).toString(),
      },
      medium: {
        total: Numbers.countEntriesTotal("medium", totalAcrossUsers).toString(),
        unique: Numbers.countEntriesUnique("medium", uniqueAcrossUsers).toString(),
      },
      hard: {
        total: Numbers.countEntriesTotal("hard", totalAcrossUsers).toString(),
        unique: Numbers.countEntriesUnique("hard", uniqueAcrossUsers).toString(),
      },
      legendary: {
        total: Numbers.countEntriesTotal("legendary", totalAcrossUsers).toString(),
        unique: Numbers.countEntriesUnique("legendary", uniqueAcrossUsers).toString(),
      },
    },
    numberPercentages: {
      total: formatPercent(uniqueAcrossUsers.length / Numbers.UNIQUE_ENTRIES),
      easy: formatPercent(
        Numbers.countEntriesUnique("easy", uniqueAcrossUsers) / Numbers.UNIQUE_EASY_ENTRIES,
      ),
      medium: formatPercent(
        Numbers.countEntriesUnique("medium", uniqueAcrossUsers) / Numbers.UNIQUE_MEDIUM_ENTRIES,
      ),
      hard: formatPercent(
        Numbers.countEntriesUnique("hard", uniqueAcrossUsers) / Numbers.UNIQUE_HARD_ENTRIES,
      ),
      legendary: formatPercent(
        Numbers.countEntriesUnique("legendary", uniqueAcrossUsers)
          / Numbers.UNIQUE_LEGENDARY_ENTRIES,
      ),
    },
  };

  const content = joinStringArray([
    `# Server statistics for ${thisServer}:`,
    `- users that have played: ${calculatedStatistics.totalUsers}`,
    `- total terminus tokens across the servers: ${calculatedStatistics.totalTokens}`,
    `- numbers guessed: ${calculatedStatistics.numbersGuessed.total} (total), ${calculatedStatistics.numbersGuessed.unique} (unique) [${calculatedStatistics.numberPercentages.total}]`,
    `  - easy numbers: ${calculatedStatistics.numbersGuessed.easy.total} (total), ${calculatedStatistics.numbersGuessed.easy.unique} (unique) [${calculatedStatistics.numberPercentages.easy}]`,
    `  - medium numbers: ${calculatedStatistics.numbersGuessed.medium.total} (total), ${calculatedStatistics.numbersGuessed.medium.unique} (unique) [${calculatedStatistics.numberPercentages.medium}]`,
    `  - hard numbers: ${calculatedStatistics.numbersGuessed.hard.total} (total), ${calculatedStatistics.numbersGuessed.hard.unique} (unique) [${calculatedStatistics.numberPercentages.hard}]`,
    `  - legendary numbers: ${calculatedStatistics.numbersGuessed.legendary.total} (total), ${calculatedStatistics.numbersGuessed.legendary.unique} (unique) [${calculatedStatistics.numberPercentages.legendary}]`,
  ]);

  await interaction.reply({ content });
}
