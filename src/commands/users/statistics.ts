import type { Client } from "discord.js";
import { UserProfile } from "../../entities/user-profile";
import { UNIQUE_EASY_ENTRIES, UNIQUE_ENTRIES, UNIQUE_HARD_ENTRIES, UNIQUE_LEGENDARY_ENTRIES, UNIQUE_MEDIUM_ENTRIES } from "../../utils/constants";
import { formatPercent } from "../../utils/formatter";
import { countEntriesTotal, countEntriesUnique } from "../../utils/numbers";
import type { ServerSlashCommandInteraction } from "../types";

export default async function serverStatisticsDisplay(_: Client, interaction: ServerSlashCommandInteraction): Promise<void> {
  const users = await UserProfile.find({
    where: { guildId: interaction.guildId },
  });

  const thisServer = interaction.guild?.name ?? "(couldn't get name)";

  const uniqueAcrossUsers = users.flatMap(user => user.uniqueGuessed)
    .filter((value, index, array) => array.indexOf(value) === index);
  const totalAcrossUsers = users.flatMap(user => user.guessedEntries);

  const calculatedStatistics = {
    totalUsers: users.length.toString(),
    totalTokens: users
      .map(user => user.tokens)
      .reduce((prev, curr) => prev + curr)
      .toString(),
    numbersGuessed: {
      total: totalAcrossUsers.length.toString(),
      unique: uniqueAcrossUsers.length.toString(),
      easy: {
        total: countEntriesTotal("easy", totalAcrossUsers).toString(),
        unique: countEntriesUnique("easy", uniqueAcrossUsers).toString(),
      },
      medium: {
        total: countEntriesTotal("medium", totalAcrossUsers).toString(),
        unique: countEntriesUnique("medium", uniqueAcrossUsers).toString(),
      },
      hard: {
        total: countEntriesTotal("hard", totalAcrossUsers).toString(),
        unique: countEntriesUnique("hard", uniqueAcrossUsers).toString(),
      },
      legendary: {
        total: countEntriesTotal("legendary", totalAcrossUsers).toString(),
        unique: countEntriesUnique("legendary", uniqueAcrossUsers).toString(),
      },
    },
    numberPercentages: {
      total: formatPercent(uniqueAcrossUsers.length / UNIQUE_ENTRIES),
      easy: formatPercent(countEntriesUnique("easy", uniqueAcrossUsers) / UNIQUE_EASY_ENTRIES),
      medium: formatPercent(countEntriesUnique("medium", uniqueAcrossUsers) / UNIQUE_MEDIUM_ENTRIES),
      hard: formatPercent(countEntriesUnique("hard", uniqueAcrossUsers) / UNIQUE_HARD_ENTRIES),
      legendary: formatPercent(countEntriesUnique("legendary", uniqueAcrossUsers) / UNIQUE_LEGENDARY_ENTRIES),
    },
  };

  const content = [
    `# Server statistics for ${thisServer}:`,
    `- users that have played: ${calculatedStatistics.totalUsers}`,
    `- total terminus tokens across the servers: ${calculatedStatistics.totalTokens}`,
    `- numbers guessed: ${calculatedStatistics.numbersGuessed.total} (total), ${calculatedStatistics.numbersGuessed.unique} (unique) [${calculatedStatistics.numberPercentages.total}]`,
    `  - easy numbers: ${calculatedStatistics.numbersGuessed.easy.total} (total), ${calculatedStatistics.numbersGuessed.easy.unique} (unique) [${calculatedStatistics.numberPercentages.easy}]`,
    `  - medium numbers: ${calculatedStatistics.numbersGuessed.medium.total} (total), ${calculatedStatistics.numbersGuessed.medium.unique} (unique) [${calculatedStatistics.numberPercentages.medium}]`,
    `  - hard numbers: ${calculatedStatistics.numbersGuessed.hard.total} (total), ${calculatedStatistics.numbersGuessed.hard.unique} (unique) [${calculatedStatistics.numberPercentages.hard}]`,
    `  - legendary numbers: ${calculatedStatistics.numbersGuessed.legendary.total} (total), ${calculatedStatistics.numbersGuessed.legendary.unique} (unique) [${calculatedStatistics.numberPercentages.legendary}]`,
  ];

  await interaction.reply({ content: content.join("\n") });
}
