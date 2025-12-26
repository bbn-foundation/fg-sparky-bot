import type { Client } from "discord.js";
import { UNIQUE_EASY_ENTRIES, UNIQUE_ENTRIES, UNIQUE_HARD_ENTRIES, UNIQUE_LEGENDARY_ENTRIES, UNIQUE_MEDIUM_ENTRIES } from "../../utils/constants";
import { formatPercent } from "../../utils/formatter";
import { countEntriesTotal, countEntriesUnique } from "../../utils/numbers";
import { getUser } from "../../utils/user";
import type { ServerSlashCommandInteraction } from "../types";

export default async function userShow(client: Client, interaction: ServerSlashCommandInteraction): Promise<void> {
  const userId = interaction.options.get("user", true).value as string;
  const userInfo = await getUser(userId, interaction.guildId);
  const discordUser = await client.users.fetch(userId);
  if (userInfo) {
    const { guessedEntries, uniqueGuessed, numberhumansGuessed, numberhumansGuessedUnique } = userInfo;
    const percentage = {
      all: uniqueGuessed.length / UNIQUE_ENTRIES,
      easy: countEntriesUnique("easy", uniqueGuessed) / UNIQUE_EASY_ENTRIES,
      medium: countEntriesUnique("medium", uniqueGuessed) / UNIQUE_MEDIUM_ENTRIES,
      hard: countEntriesUnique("hard", uniqueGuessed) / UNIQUE_HARD_ENTRIES,
      legendary: countEntriesUnique("legendary", uniqueGuessed) / UNIQUE_LEGENDARY_ENTRIES,
    };
    const content = [
      `# Profile information for ${discordUser.displayName} (${discordUser.username})`,
      "## fg sparky:",
      `terminus tokens: ${userInfo.tokens.toString()} <:terminusfinity:1444859277515690075>`,
      `highest guessing streak: ${Math.max(userInfo.bestStreak - 1, 0).toString()}`,
      `numbers guessed: ${guessedEntries.length.toString()} (total), ${uniqueGuessed.length.toString()} (unique) [${formatPercent(percentage.all)}]`,
      `- easy numbers: ${countEntriesTotal("easy", guessedEntries).toString()} (total), ${countEntriesUnique("easy", uniqueGuessed).toString()} (unique) [${formatPercent(percentage.easy)}]`,
      `- medium numbers: ${countEntriesTotal("medium", guessedEntries).toString()} (total), ${countEntriesUnique("medium", uniqueGuessed).toString()} (unique) [${formatPercent(percentage.medium)}]`,
      `- hard numbers: ${countEntriesTotal("hard", guessedEntries).toString()} (total), ${countEntriesUnique("hard", uniqueGuessed).toString()} (unique) [${formatPercent(percentage.hard)}]`,
      `- legendary numbers: ${countEntriesTotal("legendary", guessedEntries).toString()} (total), ${countEntriesUnique("legendary", uniqueGuessed).toString()} (unique) [${formatPercent(percentage.legendary)}]`,
      "",
      "## numberdex:",
      `numberhumans caught: ${numberhumansGuessed.length.toString()} (total), ${numberhumansGuessedUnique.length.toString()} (unique)`,
    ];
    await interaction.reply({
      content: content.join("\n"),
    });
  } else {
    await interaction.reply("sorry, fg sparky bot doesn't have data for this user");
  }
}
