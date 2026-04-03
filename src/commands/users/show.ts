import { getUser, NumberhumanData } from "#db";
import { EvolutionType } from "#numberdex/evolutions.ts";
import { Numberhumans, Numbers } from "#stores";
import { formatPercent, joinStringArray } from "#utils/formatter.ts";
import type { ServerSlashCommandInteraction } from "#utils/types.ts";
import { bold, chatInputApplicationCommandMention, type Client } from "discord.js";

const slashCommandMention = chatInputApplicationCommandMention(
  "numberdex show-humans",
  process.env.NODE_ENV === "development" ? "1454578425414291613" : "1452067362458308820",
);

export default async function userShow(
  _: Client,
  interaction: ServerSlashCommandInteraction,
): Promise<void> {
  await interaction.deferReply();

  const discordUser = interaction.options.getUser("user", true);
  const userInfo = await getUser(discordUser.id, interaction.guildId);
  if (userInfo) {
    const { guessedEntries, uniqueGuessed, numberhumansGuessed, numberhumansGuessedUnique } = userInfo;
    const percentage = {
      all: uniqueGuessed.length / Numbers.UNIQUE_ENTRIES,
      easy: Numbers.countEntriesUnique("easy", uniqueGuessed) / Numbers.UNIQUE_EASY_ENTRIES,
      medium: Numbers.countEntriesUnique("medium", uniqueGuessed) / Numbers.UNIQUE_MEDIUM_ENTRIES,
      hard: Numbers.countEntriesUnique("hard", uniqueGuessed) / Numbers.UNIQUE_HARD_ENTRIES,
      legendary: Numbers.countEntriesUnique("legendary", uniqueGuessed) / Numbers.UNIQUE_LEGENDARY_ENTRIES,
      numberdex: numberhumansGuessedUnique.length / Numberhumans.UNIQUE_ENTRIES,
    };
    const numberhumans = await NumberhumanData.find({
      where: {
        caughtBy: {
          id: userInfo.id,
          guildId: userInfo.guildId,
        },
      },
      relations: {
        caughtBy: true,
      },
    });

    const content = joinStringArray([
      `# Profile information for ${discordUser.displayName} (${discordUser.username})`,
      "## FG Sparky:",
      `Your highest guessing streak before failing was ${bold(Math.max(userInfo.bestStreak - 1, 0).toString())}.`,
      `Terminus Tokens earned: ${userInfo.tokens.toString()} <:terminusfinity:1444859277515690075>`,
      `In total, you have guessed ${
        bold(guessedEntries.length.toString())
      } entries correctly. Out of those, ${uniqueGuessed.length.toString()} were a unique entry within the number store, meaning you are ${
        formatPercent(percentage.all)
      } of the way to completing FG sparky.`,
      `### Numbers guessed by difficulty:`,
      `- Easy numbers: ${Numbers.countEntriesTotal("easy", guessedEntries).toString()} (total), ${
        Numbers.countEntriesUnique("easy", uniqueGuessed).toString()
      } (unique) [${formatPercent(percentage.easy)}]`,
      `- Medium numbers: ${Numbers.countEntriesTotal("medium", guessedEntries).toString()} (total), ${
        Numbers.countEntriesUnique("medium", uniqueGuessed).toString()
      } (unique) [${formatPercent(percentage.medium)}]`,
      `- Hard numbers: ${Numbers.countEntriesTotal("hard", guessedEntries).toString()} (total), ${
        Numbers.countEntriesUnique("hard", uniqueGuessed).toString()
      } (unique) [${formatPercent(percentage.hard)}]`,
      `- Legendary numbers: ${Numbers.countEntriesTotal("legendary", guessedEntries).toString()} (total), ${
        Numbers.countEntriesUnique("legendary", uniqueGuessed).toString()
      } (unique) [${formatPercent(percentage.legendary)}]`,
      "",
      "## Numberdex stats:",
      `You have caught ${numberhumansGuessed.length.toString()} in total, ${numberhumansGuessedUnique.length.toString()} of which were unique catches, meaning you are ${
        formatPercent(percentage.numberdex)
      } of the way there to completing the Numberdex set.`,
      `Out of the ${numberhumansGuessed.length.toString()} numberhumans caught:`,
      `- ${
        numberhumansGuessed.length - numberhumans.length
      } of them were caught before v0.14.0, the update that added stats to numberhumans.`,
      `- ${numberhumans.filter(value => value.evolution !== EvolutionType.None).length} had an evolution.`,
      `View more numberhuman information by running ${slashCommandMention}.`,
    ]);
    await interaction.followUp({
      content,
    });
  } else {
    await interaction.followUp("sorry, fg sparky bot doesn't have data for this user");
  }
}
