import type { Client } from "discord.js";
import { UserProfile } from "../../entities/user-profile";
import { countEntriesTotal, countEntriesUnique } from "../../utils/numbers";
import type { ServerSlashCommandInteraction } from "../types";

export default async function serverStatisticsDisplay(_: Client, interaction: ServerSlashCommandInteraction): Promise<void> {
  const users = await UserProfile.find({
    where: { guildId: interaction.guildId },
  });

  const thisServer = interaction.guild?.name ?? "(couldn't get name)";

  const uniqueAcrossUsers = users.flatMap(user => user.uniqueGuessed);
  const totalAcrossUsers = users.flatMap(user => user.guessedEntries);

  const calculatedStatistics = {
    totalUsers: users.length.toString(),
    totalTokens: users
      .map(user => user.tokens)
      .reduce((prev, curr) => prev + curr)
      .toString(),
    numbersGuessed: {
      total: users
        .map(user => user.guessedEntries.length)
        .reduce((prev, curr) => prev + curr)
        .toString(),
      unique: users
        .map(user => user.uniqueGuessed.length)
        .reduce((prev, curr) => prev + curr)
        .toString(),
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
  };

  const content = [
    `# Server statistics for ${thisServer}:`,
    `- users that have played: ${calculatedStatistics.totalUsers}`,
    `- total terminus tokens across the servers: ${calculatedStatistics.totalTokens}`,
    `- numbers guessed: ${calculatedStatistics.numbersGuessed.total} (total), ${calculatedStatistics.numbersGuessed.unique} (unique),`,
    `  - easy numbers: ${calculatedStatistics.numbersGuessed.easy.total} (total), ${calculatedStatistics.numbersGuessed.easy.unique} (unique)`,
    `  - medium numbers: ${calculatedStatistics.numbersGuessed.medium.total} (total), ${calculatedStatistics.numbersGuessed.medium.unique} (unique)`,
    `  - hard numbers: ${calculatedStatistics.numbersGuessed.hard.total} (total), ${calculatedStatistics.numbersGuessed.hard.unique} (unique)`,
    `  - legendary numbers: ${calculatedStatistics.numbersGuessed.legendary.total} (total), ${calculatedStatistics.numbersGuessed.legendary.unique} (unique)`,
  ];

  await interaction.reply({ content: content.join("\n") });
}
