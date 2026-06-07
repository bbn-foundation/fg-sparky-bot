import { NumberhumanData, UserProfile } from "#db";
import { EvolutionType } from "#numberdex/evolutions.ts";
import { Numberhumans, Numbers } from "#stores";
import { formatPercent, joinStringArray } from "#utils/formatter.ts";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { bold, ButtonStyle, ComponentType, formatEmoji, type Client } from "discord.js";

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
  const averageAcrossUsers = users.map(user => user.guessedEntries.length);

  const calculatedStatistics = {
    totalUsers: users.length.toString(),
    totalTokens: users
      .map((user) => user.tokens)
      .reduce((prev, curr) => prev + curr)
      .toString(),
    numbersGuessed: {
      total: totalAcrossUsers.length.toString(),
      unique: uniqueAcrossUsers.length.toString(),
      average: Math.round(averageAcrossUsers.reduce((a, b) => a + b) / averageAcrossUsers.length),
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

  const numberhumans = await NumberhumanData.find({
    where: {
      caughtBy: {
        guildId: interaction.guildId,
      }
    }
  });

  const totalHumans = users.flatMap(user => user.numberhumansGuessed);
  const uniqueHumans = users.flatMap(user => user.numberhumansGuessedUnique)
    .filter((value, index, array) => array.indexOf(value) === index)

  const numberdexStats = {
    totalHumans: totalHumans.length.toString(),
    uniqueHumans: uniqueHumans.length.toString(),
    completionRate: formatPercent(uniqueHumans.length / Numberhumans.UNIQUE_ENTRIES),
    evolutions: {
      total: numberhumans.filter(numberhuman => numberhuman.evolution !== EvolutionType.None).length.toString(),
    }
  };

  const message = new PaginatedMessage();

  message.setActions([
    {
			customId: '@sapphire/paginated-messages.previousPage',
			style: ButtonStyle.Primary,
			emoji: '◀️',
			type: ComponentType.Button,
			run: ({ handler }) => {
				if (handler.index === 0) {
					handler.index = handler.pages.length - 1;
				} else {
					--handler.index;
				}
			}
		},
		{
			customId: '@sapphire/paginated-messages.nextPage',
			style: ButtonStyle.Primary,
			emoji: '▶️',
			type: ComponentType.Button,
			run: ({ handler }) => {
				if (handler.index === handler.pages.length - 1) {
					handler.index = 0;
				} else {
					++handler.index;
				}
			}
		},
  ])

  message.addPage({
    content: joinStringArray([
      `# User statistics for ${thisServer}:`,
      `A total of ${bold(calculatedStatistics.totalUsers)} users has used this bot.`,
      ``,
      `## FG Sparky:`,
      `Across your ${bold(calculatedStatistics.totalUsers)} users, they have gathered a total of ${calculatedStatistics.totalTokens} ${formatEmoji("1444859277515690075")}`,
      `They have guessed ${bold(calculatedStatistics.numbersGuessed.total)} entries in total, of which ${bold(calculatedStatistics.numbersGuessed.unique)} was a unique entry in the store, meaning the players are ${bold(calculatedStatistics.numberPercentages.total)} of the way to guessing all of FG sparky.`,
      `On average, each player has guessed ${bold(calculatedStatistics.numbersGuessed.average.toString())} numbers.`,
      `### Guesses by difficulty:`,
      `- Easy: ${calculatedStatistics.numbersGuessed.easy.total} (total), ${calculatedStatistics.numbersGuessed.easy.unique} (unique) [${calculatedStatistics.numberPercentages.easy}]`,
      `- Medium: ${calculatedStatistics.numbersGuessed.medium.total} (total), ${calculatedStatistics.numbersGuessed.medium.unique} (unique) [${calculatedStatistics.numberPercentages.medium}]`,
      `- Hard: ${calculatedStatistics.numbersGuessed.hard.total} (total), ${calculatedStatistics.numbersGuessed.hard.unique} (unique) [${calculatedStatistics.numberPercentages.hard}]`,
      `- Legendary: ${calculatedStatistics.numbersGuessed.legendary.total} (total), ${calculatedStatistics.numbersGuessed.legendary.unique} (unique) [${calculatedStatistics.numberPercentages.legendary}]`
    ]),
  });

  message.addPageContent(joinStringArray([
    `# User statistics for ${thisServer}:`,
    `A total of ${bold(calculatedStatistics.totalUsers)} users has used this bot.`,
    ``,
    `## Numberdex:`,
    `Across your ${bold(calculatedStatistics.totalUsers)} users, they have collected a total of ${bold(numberdexStats.totalHumans)} numberhumans, of which ${bold(numberdexStats.uniqueHumans)} was a unique entry, meaning the players are ${bold(numberdexStats.completionRate)} of the way to capturing every single numberhuman.`,
    `Out of the total ${bold(numberdexStats.totalHumans)} numberhumans, a total of ${bold(numberdexStats.evolutions.total)} has been evolved.`,
  ]))

  message.run(interaction);
}
