import { getUser } from "@fg-sparky/server";
import { formatPercent, joinStringArray, type ServerSlashCommandInteraction } from "@fg-sparky/utils";
import type { Client } from "discord.js";
import { Numbers } from "../../stores.ts";

export default async function userShow(_: Client, interaction: ServerSlashCommandInteraction): Promise<void> {
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
    };
    const content = joinStringArray([
      `# Profile information for ${discordUser.displayName} (${discordUser.username})`,
      "## fg sparky:",
      `terminus tokens: ${userInfo.tokens.toString()} <:terminusfinity:1444859277515690075>`,
      `highest guessing streak: ${Math.max(userInfo.bestStreak - 1, 0).toString()}`,
      `numbers guessed: ${guessedEntries.length.toString()} (total), ${uniqueGuessed.length.toString()} (unique) [${formatPercent(percentage.all)}]`,
      `- easy numbers: ${Numbers.countEntriesTotal("easy", guessedEntries).toString()} (total), ${Numbers.countEntriesUnique("easy", uniqueGuessed).toString()} (unique) [${formatPercent(percentage.easy)}]`,
      `- medium numbers: ${Numbers.countEntriesTotal("medium", guessedEntries).toString()} (total), ${Numbers.countEntriesUnique("medium", uniqueGuessed).toString()} (unique) [${formatPercent(percentage.medium)}]`,
      `- hard numbers: ${Numbers.countEntriesTotal("hard", guessedEntries).toString()} (total), ${Numbers.countEntriesUnique("hard", uniqueGuessed).toString()} (unique) [${formatPercent(percentage.hard)}]`,
      `- legendary numbers: ${Numbers.countEntriesTotal("legendary", guessedEntries).toString()} (total), ${Numbers.countEntriesUnique("legendary", uniqueGuessed).toString()} (unique) [${formatPercent(percentage.legendary)}]`,
      "",
      "## numberdex:",
      `numberhumans caught: ${numberhumansGuessed.length.toString()} (total), ${numberhumansGuessedUnique.length.toString()} (unique)`,
    ]);
    await interaction.reply({
      content,
    });
  } else {
    await interaction.reply("sorry, fg sparky bot doesn't have data for this user");
  }
}
